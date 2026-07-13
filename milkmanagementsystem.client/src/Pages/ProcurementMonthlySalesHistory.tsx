/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { ProcurementEntryService } from "../Services/ProcurementEntryService";
import type { ProcurementEntryDto } from "../Services/ProcurementEntryService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

const ProcurementMonthlyHistory: React.FC = () => {
    const [entries, setEntries] = useState<ProcurementEntryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(0);
    const [supplierSearch, setSupplierSearch] = useState("");
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
            const data = await ProcurementEntryService.getAll();
            setEntries(Array.isArray(data) ? data : (data as any)?.$values ?? []);
        } catch {
            setError("Failed to load procurement data.");
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

    const getAllDaysInMonth = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const today = new Date();
        const days: string[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            if (date > today) break;
            const dateStr = `${day.toString().padStart(2, "0")}-${selectedMonth.toString().padStart(2, "0")}-${selectedYear}`;
            days.push(dateStr);
        }
        return days;
    };

    const monthEntries = entries.filter((e) => {
        const d = new Date(e.entryDate);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const dailySummary = () => {
        const allDays = getAllDaysInMonth();
        const map: Record<string, { totalQty: number; totalAmount: number }> = {};

        monthEntries.forEach((e) => {
            const d = new Date(e.entryDate);
            const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
            if (!map[dateStr]) map[dateStr] = { totalQty: 0, totalAmount: 0 };
            map[dateStr].totalQty += Number(e.quantity) || 0;
            map[dateStr].totalAmount += Number(e.totalAmount) || 0;
        });

        return allDays.map(dateStr => ({
            date: dateStr,
            totalQty: map[dateStr]?.totalQty ?? 0,
            totalAmount: map[dateStr]?.totalAmount ?? 0,
            hasEntry: !!map[dateStr],
        }));
    };

    // Supplier (Farmer) wise summary
    const supplierSummary = () => {
        const map: Record<number, {
            employeeId: number;
            supplierName: string;
            cowQty: number;
            buffaloQty: number;
            totalAmount: number;
        }> = {};

        monthEntries.forEach((e) => {
            const empId = Number(e.employeeId);
            if (!map[empId]) {
                map[empId] = {
                    employeeId: empId,
                    supplierName: e.supplierName || `Supplier #${empId}`,
                    cowQty: 0,
                    buffaloQty: 0,
                    totalAmount: 0,
                };
            }
            const qty = Number(e.quantity) || 0;
            if (e.milkType?.toLowerCase() === "cow") map[empId].cowQty += qty;
            else if (e.milkType?.toLowerCase() === "buffalo") map[empId].buffaloQty += qty;
            map[empId].totalAmount += Number(e.totalAmount) || 0;
        });

        return Object.values(map).sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    };

    const daily = dailySummary();
    const supSummary = supplierSummary();
    const filteredSupSummary = supSummary.filter(s =>
        s.supplierName.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    const totalQty = daily.reduce((s, d) => s + d.totalQty, 0);
    const totalAmount = daily.reduce((s, d) => s + d.totalAmount, 0);

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="container-fluid mt-3 px-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold mb-0">Procurement Monthly History</h4>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {monthNames[selectedMonth - 1]} {selectedYear} — Procurement Overview
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
                            <div className="position-absolute end-0 mt-2 shadow-lg"
                                style={{
                                    background: "#fff", border: "1px solid #dee2e6",
                                    borderRadius: "12px", zIndex: 1050,
                                    width: "280px", padding: "16px"
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

                {loading ? <Loader text="Loading procurement history..." /> : (
                    <>
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-6">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-success">{totalQty.toFixed(2)} L</div>
                                        <div className="text-muted small">Total Qty Procured</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-6">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-primary">₹{totalAmount.toFixed(2)}</div>
                                        <div className="text-muted small">Total Procurement Amount</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Procurement Table */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3">
                                📅 Daily Procurement — {monthNames[selectedMonth - 1]} {selectedYear}
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Date</th>
                                            <th>Total Qty (L)</th>
                                            <th>Total Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daily.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center text-muted py-4">
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
                                            </tr>
                                        ))}
                                    </tbody>
                                    {daily.length > 0 && (
                                        <tfoot>
                                            <tr style={{ background: "#f1f8f4" }}>
                                                <td className="fw-bold text-end">Total:</td>
                                                <td className="fw-bold text-success">{totalQty.toFixed(2)} L</td>
                                                <td className="fw-bold text-success">₹{totalAmount.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Supplier (Farmer) wise Summary */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center flex-nowrap gap-3 mb-3">
                                <h5 className="fw-bold mb-0 text-truncate" style={{ flexShrink: 0 }}>
                                    🧑‍🌾 Supplier wise Summary — {monthNames[selectedMonth - 1]} {selectedYear}
                                </h5>
                                <input
                                    type="text"
                                    placeholder="🔍 Search supplier..."
                                    value={supplierSearch}
                                    onChange={(e) => setSupplierSearch(e.target.value)}
                                    className="form-control flex-shrink-0"
                                    style={{ maxWidth: "180px", borderRadius: "8px" }}
                                />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Supplier</th>
                                            <th>Cow Qty (L)</th>
                                            <th>Buffalo Qty (L)</th>
                                            <th>Total Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSupSummary.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted py-4">
                                                    No matching supplier found.
                                                </td>
                                            </tr>
                                        ) : filteredSupSummary.map((s, i) => (
                                            <tr key={i}>
                                                <td className="fw-semibold">{s.supplierName}</td>
                                                <td>{s.cowQty.toFixed(2)}</td>
                                                <td>{s.buffaloQty.toFixed(2)}</td>
                                                <td>₹{s.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {supSummary.length > 0 && (
                                        <tfoot>
                                            <tr style={{ background: "#f1f8f4" }}>
                                                <td className="fw-bold">Total</td>
                                                <td className="fw-bold">{supSummary.reduce((s, x) => s + x.cowQty, 0).toFixed(2)} L</td>
                                                <td className="fw-bold">{supSummary.reduce((s, x) => s + x.buffaloQty, 0).toFixed(2)} L</td>
                                                <td className="fw-bold text-primary">₹{totalAmount.toFixed(2)}</td>
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

export default ProcurementMonthlyHistory;