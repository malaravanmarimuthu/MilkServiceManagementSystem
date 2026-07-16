/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import { getSubscriptions } from "../Services/SubscriptionService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getEmployees } from "../Services/EmployeeService";
import { PaymentService } from "../Services/PaymentService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

const MonthlySalesHistory: React.FC = () => {
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [empSearch, setEmpSearch] = useState("");
    const [pickerYear, setPickerYear] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (showPicker) setPickerYear(selectedYear);
    }, [showPicker]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
                setShowPicker(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [entryData, subData, empSubData, empData, payData] = await Promise.all([
                MilkEntryService.getAll(),
                getSubscriptions(),
                getEmployeeSubscriptions(),
                getEmployees(),
                PaymentService.getAll(),
            ]);

            setEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setSubscriptions(Array.isArray(subData) ? subData : (subData as any)?.$values ?? (subData as any)?.data ?? []);
            setEmpSubscriptions(Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []);
            setEmployees(Array.isArray(empData?.data) ? empData.data : empData?.data?.$values ?? []);
            const payArr = Array.isArray(payData) ? payData : (payData as any)?.$values ?? (payData as any)?.data ?? [];
            setPayments(payArr);
        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const isFutureMonth = (month: number, year: number) => {
        if (year > currentYear) return true;
        if (year === currentYear && month > currentMonth) return true;
        return false;
    };

    const handleMonthSelect = (month: number) => {
        if (isFutureMonth(month, pickerYear)) return;
        setSelectedMonth(month);
        setSelectedYear(pickerYear);
        setShowPicker(false);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getSubPrice = (subId: number) => {
        const sub = subscriptions.find((s: any) => (s.subscriptionID ?? s.subscriptionId) === subId);
        return sub?.pricePerLiter ?? sub?.PricePerLiter ?? 0;
    };

    const getEmpName = (empId: number) => {
        const emp = employees.find((e: any) => (e.id ?? e.ID) === empId);
        return emp ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() : `Emp #${empId}`;
    };

    const getEmpSubscription = (empId: number) => {
        return empSubscriptions.find((s: any) =>
            Number(s.employeeId ?? s.EmployeeId ?? s.employeeID ?? s.EmployeeID) === empId
        );
    };

    // Get all days in selected month
    const getAllDaysInMonth = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const today = new Date();
        const days: string[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            // Future dates skip — today வரை மட்டும்
            if (date > today) break;
            const dateStr = `${day.toString().padStart(2, "0")}-${selectedMonth.toString().padStart(2, "0")}-${selectedYear}`;
            days.push(dateStr);
        }
        return days;
    };

    // Filter entries for selected month
    const monthEntries = entries.filter((e: any) => {
        const d = new Date(e.entryDate);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Filter payments for selected month
    const monthPayments = payments.filter((p: any) => {
        const d = new Date(p.paidDate ?? p.PaidDate ?? "");
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Daily summary — ALL days in month (0 for no entry days), now includes payment + pending
    const dailySummary = () => {
        const allDays = getAllDaysInMonth();

        // Build sales map (qty + amount) per day
        const salesMap: Record<string, { totalQty: number; totalAmount: number }> = {};

        monthEntries.forEach((e: any) => {
            if (e.entryType === "Leave") return;
            const d = new Date(e.entryDate);
            const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
            if (!salesMap[dateStr]) salesMap[dateStr] = { totalQty: 0, totalAmount: 0 };
            salesMap[dateStr].totalQty += e.quantity ?? 0;

            const empSub = getEmpSubscription(e.employeeID);
            const subId = empSub?.subscriptionId ?? empSub?.SubscriptionId ?? empSub?.subscriptionID;
            const price = subId ? getSubPrice(subId) : 0;
            salesMap[dateStr].totalAmount += (e.quantity ?? 0) * price;
        });

        // Build payment map per day
        const paymentMap: Record<string, number> = {};
        monthPayments.forEach((p: any) => {
            const d = new Date(p.paidDate ?? p.PaidDate ?? "");
            const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
            paymentMap[dateStr] = (paymentMap[dateStr] ?? 0) + Number(p.totalAmount ?? p.TotalAmount ?? 0);
        });

        // Return ALL days — 0 for missing dates
        return allDays.map(dateStr => {
            const totalQty = salesMap[dateStr]?.totalQty ?? 0;
            const totalAmount = salesMap[dateStr]?.totalAmount ?? 0;
            const paidAmount = paymentMap[dateStr] ?? 0;
            const pendingAmount = totalAmount - paidAmount;
            return {
                date: dateStr,
                totalQty,
                totalAmount,
                paidAmount,
                pendingAmount,
                hasEntry: !!salesMap[dateStr],
            };
        });
    };

    // Employee wise summary
    const employeeSummary = () => {
        const map: Record<number, {
            empId: number;
            empName: string;
            actualQty: number;
            otherQty: number;
            leaveDays: number;
            totalAmount: number;
            paidAmount: number;
        }> = {};

        monthEntries.forEach((e: any) => {
            const empId = Number(e.employeeID ?? e.EmployeeID);
            if (!map[empId]) {
                map[empId] = {
                    empId,
                    empName: getEmpName(empId),
                    actualQty: 0,
                    otherQty: 0,
                    leaveDays: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                };
            }

            const empSub = getEmpSubscription(empId);
            const subId = empSub?.subscriptionId ?? empSub?.SubscriptionId ?? empSub?.subscriptionID;
            const price = subId ? getSubPrice(subId) : 0;

            if (e.entryType === "Actual") {
                map[empId].actualQty += e.quantity ?? 0;
                map[empId].totalAmount += (e.quantity ?? 0) * price;
            } else if (e.entryType === "Other") {
                map[empId].otherQty += e.quantity ?? 0;
                map[empId].totalAmount += (e.quantity ?? 0) * price;
            } else if (e.entryType === "Leave") {
                map[empId].leaveDays += 1;
            }
        });

        monthPayments.forEach((p: any) => {
            const empId = Number(p.employeeID ?? p.EmployeeID);
            if (map[empId]) {
                map[empId].paidAmount += Number(p.totalAmount ?? p.TotalAmount ?? 0);
            }
        });

        return Object.values(map).sort((a, b) => a.empName.localeCompare(b.empName));
    };

    const daily = dailySummary();
    const empSummary = employeeSummary();
    const filteredEmpSummary = empSummary.filter(emp =>
        emp.empName.toLowerCase().includes(empSearch.toLowerCase())
    );

    const totalQty = daily.reduce((s, d) => s + d.totalQty, 0);
    const totalSaleAmount = daily.reduce((s, d) => s + d.totalAmount, 0);
    const totalPaid = monthPayments.reduce((s: number, p: any) =>
        s + Number(p.totalAmount ?? p.TotalAmount ?? 0), 0
    );
    const totalPending = totalSaleAmount - totalPaid;

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="container-fluid mt-3 px-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold mb-0">Monthly Sales History</h4>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {monthNames[selectedMonth - 1]} {selectedYear} — Sales Overview
                        </div>
                    </div>

                    {/* Month Picker */}
                    <div className="position-relative" ref={pickerRef}>
                        <button
                            className="btn d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                            style={{
                                background: "#1B4332", color: "#fff", border: "none",
                                borderRadius: "8px", fontSize: "0.95rem",
                                minWidth: "180px", justifyContent: "space-between"
                            }}
                            onClick={() => setShowPicker(p => !p)}
                        >
                            <span>📅</span>
                            <span>{monthNames[selectedMonth - 1]} {selectedYear}</span>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>▼</span>
                        </button>

                        {showPicker && (
                            <div className="position-fixed shadow-lg"
                                style={{
                                    background: "#fff", border: "1px solid #dee2e6",
                                    borderRadius: "12px", zIndex: 1050,
                                    width: "min(280px, 90vw)",
                                    left: "33%",
                                    top: "50%",
                                    transform: "translate(-50%, -50%)",
                                    padding: "16px",
                                    maxHeight: "80vh",
                                    overflowY: "auto"
                                }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <button className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y - 1)}>‹</button>
                                    <span className="fw-bold" style={{ color: "#1B4332", fontSize: "1rem" }}>
                                        {pickerYear}
                                    </span>
                                    <button className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y + 1)}
                                        disabled={pickerYear >= currentYear}>›</button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                                    {monthShort.map((m, i) => {
                                        const monthNum = i + 1;
                                        const isSelected = monthNum === selectedMonth && pickerYear === selectedYear;
                                        const isDisabled = isFutureMonth(monthNum, pickerYear);
                                        return (
                                            <button key={m}
                                                onClick={() => handleMonthSelect(monthNum)}
                                                disabled={isDisabled}
                                                style={{
                                                    border: isSelected ? "2px solid #1B4332" : "1px solid #dee2e6",
                                                    borderRadius: "8px", padding: "8px 4px",
                                                    fontSize: "0.85rem", fontWeight: isSelected ? 700 : 400,
                                                    background: isSelected ? "#1B4332" : isDisabled ? "#f8f9fa" : "#fff",
                                                    color: isSelected ? "#fff" : isDisabled ? "#ced4da" : "#212529",
                                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                                    transition: "all 0.15s ease",
                                                }}
                                                onMouseEnter={e => { if (!isDisabled && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#e8f5e9"; }}
                                                onMouseLeave={e => { if (!isDisabled && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                                            >{m}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? <Loader text="Loading sales history..." /> : (
                    <>
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-success">{totalQty.toFixed(2)} L</div>
                                        <div className="text-muted small">Total Qty Sold</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-primary">₹{totalSaleAmount.toFixed(2)}</div>
                                        <div className="text-muted small">Total Sale Amount</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-warning">₹{totalPaid.toFixed(2)}</div>
                                        <div className="text-muted small">Total Collected</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm"
                                    style={{ background: totalPending > 0 ? "#c0392b" : "#1B4332" }}>
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-white">₹{totalPending.toFixed(2)}</div>
                                        <div className="text-white small">
                                            {totalPending > 0 ? "Pending Amount" : "Fully Collected ✓"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Sales Table */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3">
                                📅 Daily Sales — {monthNames[selectedMonth - 1]} {selectedYear}
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Date</th>
                                            <th>Total Qty (L)</th>
                                            <th>Total Sale (₹)</th>
                                            <th>Payment (₹)</th>
                                            <th>Pending (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daily.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-4">
                                                    No data found for {monthNames[selectedMonth - 1]} {selectedYear}.
                                                </td>
                                            </tr>
                                        ) : daily.map((d, i) => (
                                            <tr key={i}
                                                style={{
                                                    background: !d.hasEntry ? "#fff8f8" : "",
                                                    color: !d.hasEntry ? "#aaa" : ""
                                                }}>
                                                <td className="fw-semibold">{d.date}</td>
                                                <td>
                                                    {d.totalQty === 0
                                                        ? <span className="text-muted">0.00</span>
                                                        : d.totalQty.toFixed(2)}
                                                </td>
                                                <td>
                                                    {d.totalAmount === 0
                                                        ? <span className="text-muted">₹0.00</span>
                                                        : `₹${d.totalAmount.toFixed(2)}`}
                                                </td>
                                                <td>
                                                    {d.paidAmount === 0
                                                        ? <span className="text-muted">₹0.00</span>
                                                        : <span className="text-success fw-semibold">₹{d.paidAmount.toFixed(2)}</span>}
                                                </td>
                                                <td>
                                                    {d.pendingAmount > 0
                                                        ? <span className="text-danger fw-semibold">₹{d.pendingAmount.toFixed(2)}</span>
                                                        : d.totalAmount > 0
                                                            ? <span className="text-success">✓ Paid</span>
                                                            : <span className="text-muted">₹0.00</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {daily.length > 0 && (
                                        <tfoot>
                                            <tr style={{ background: "#f1f8f4" }}>
                                                <td className="fw-bold text-end">Total:</td>
                                                <td className="fw-bold text-success">{totalQty.toFixed(2)} L</td>
                                                <td className="fw-bold text-success">₹{totalSaleAmount.toFixed(2)}</td>
                                                <td className="fw-bold text-success">₹{totalPaid.toFixed(2)}</td>
                                                <td className="fw-bold text-danger">₹{totalPending.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Employee wise Summary */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center flex-nowrap gap-3 mb-3">
                                <h5 className="fw-bold mb-0 text-truncate" style={{ flexShrink: 0 }}>
                                    👥 User wise Summary — {monthNames[selectedMonth - 1]} {selectedYear}
                                </h5>
                                <input
                                    type="text"
                                    placeholder="🔍 Search user..."
                                    value={empSearch}
                                    onChange={(e) => setEmpSearch(e.target.value)}
                                    className="form-control flex-shrink-0"
                                    style={{ maxWidth: "180px", borderRadius: "8px" }}
                                />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>User</th>
                                            <th>Actual Qty (L)</th>
                                            <th>Other Qty (L)</th>
                                            <th>Leave Days</th>
                                            <th>Total Amount (₹)</th>
                                            <th>Paid (₹)</th>
                                            <th>Pending (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmpSummary.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center text-muted py-4">
                                                    No matching user found.
                                                </td>
                                            </tr>
                                        ) : filteredEmpSummary.map((emp, i) => {
                                            const pending = emp.totalAmount - emp.paidAmount;
                                            return (
                                                <tr key={i}>
                                                    <td className="fw-semibold">{emp.empName}</td>
                                                    <td>{emp.actualQty.toFixed(2)}</td>
                                                    <td>{emp.otherQty.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`badge ${emp.leaveDays > 0 ? "bg-warning text-dark" : "bg-secondary"}`}>
                                                            {emp.leaveDays}
                                                        </span>
                                                    </td>
                                                    <td>₹{emp.totalAmount.toFixed(2)}</td>
                                                    <td className="text-success fw-semibold">
                                                        ₹{emp.paidAmount.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className={`fw-semibold ${pending > 0 ? "text-danger" : "text-success"}`}>
                                                            {pending > 0 ? `₹${pending.toFixed(2)}` : "✓ Paid"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {empSummary.length > 0 && (
                                        <tfoot>
                                            <tr style={{ background: "#f1f8f4" }}>
                                                <td className="fw-bold">Total</td>
                                                <td className="fw-bold">{empSummary.reduce((s, e) => s + e.actualQty, 0).toFixed(2)} L</td>
                                                <td className="fw-bold">{empSummary.reduce((s, e) => s + e.otherQty, 0).toFixed(2)} L</td>
                                                <td className="fw-bold">{empSummary.reduce((s, e) => s + e.leaveDays, 0)}</td>
                                                <td className="fw-bold text-primary">₹{totalSaleAmount.toFixed(2)}</td>
                                                <td className="fw-bold text-success">₹{totalPaid.toFixed(2)}</td>
                                                <td className="fw-bold text-danger">₹{totalPending.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MonthlySalesHistory;