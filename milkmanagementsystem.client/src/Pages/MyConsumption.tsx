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
import type { Employee } from "../Services/EmployeeService";
import { PaymentService } from "../Services/PaymentService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import { jwtDecode } from "jwt-decode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JwtPayload {
    userid: string;
    firstname: string;
    mobile: string;
    rolename: string;
}

const getLogoBase64 = async (): Promise<string | null> => {
    try {
        const res = await fetch("/logo.jpg");
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

const MyConsumption: React.FC = () => {
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);
    const [adminEmpId, setAdminEmpId] = useState<number | "">("");
    const token = localStorage.getItem("token");
    let isAdmin = false;
    let loggedEmployeeID = 0;
    let loggedEmployeeName = "My";

    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            isAdmin = decoded.rolename?.toLowerCase() === "admin";
            loggedEmployeeID = Number(decoded.userid ?? 0);
            loggedEmployeeName = `${decoded.firstname ?? ""} ${decoded.mobile ?? ""}`.trim();
        } catch (error)
        {
            console.log(error);
        }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const effectiveEmpId = isAdmin
        ? (adminEmpId !== "" ? Number(adminEmpId) : 0)
        : loggedEmployeeID;

    const effectiveEmpName = isAdmin
        ? (adminEmpId !== ""
            ? (() => {
                const emp = employees.find(e => e.id === Number(adminEmpId));
                return emp ? `${emp.firstName} ${emp.mobile}` : "Selected Employee";
            })()
            : "")
        : loggedEmployeeName;

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
            const [entryData, subData, empSubData, payData] = await Promise.all([
                MilkEntryService.getAll(),
                getSubscriptions(),
                getEmployeeSubscriptions(),
                PaymentService.getAll(),
            ]);

            setEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setSubscriptions(Array.isArray(subData) ? subData : (subData as any)?.$values ?? (subData as any)?.data ?? []);
            setEmpSubscriptions(Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []);
            const payArr = Array.isArray(payData) ? payData : (payData as any)?.$values ?? (payData as any)?.data ?? [];
            setPayments(payArr);

            if (isAdmin) {
                const empRes = await getEmployees();
                const empRaw = empRes?.data;
                const empArr: Employee[] = Array.isArray(empRaw) ? empRaw : empRaw?.$values ?? empRaw?.data ?? [];
                setEmployees(empArr);
            }
        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const getSubName = (subId: number) => {
        const sub = subscriptions.find((s: any) => (s.subscriptionID ?? s.subscriptionId) === subId);
        return sub?.milkType ?? sub?.MilkType ?? "Unknown";
    };

    const getSubPrice = (subId: number) => {
        const sub = subscriptions.find((s: any) => (s.subscriptionID ?? s.subscriptionId) === subId);
        return sub?.pricePerLiter ?? sub?.PricePerLiter ?? 0;
    };

    const getMySubscription = (empId: number) =>
        empSubscriptions.find((s: any) =>
            Number(s.employeeId ?? s.EmployeeId ?? s.employeeID ?? s.EmployeeID) === empId
        );

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

    const myEntries = effectiveEmpId === 0 ? [] : entries.filter((e: any) => {
        const eEmpId = Number(e.employeeID ?? e.EmployeeID ?? e.employeeId ?? e.EmployeeId);
        if (eEmpId !== effectiveEmpId) return false;
        const d = new Date(e.entryDate);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const actualEntries = myEntries.filter(e => e.entryType === "Actual");
    const otherEntries = myEntries.filter(e => e.entryType === "Other");

    const totalActualQty = actualEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalOtherQty = otherEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalQty = totalActualQty + totalOtherQty;

    const mySub = getMySubscription(effectiveEmpId);
    const subId = mySub?.subscriptionId ?? mySub?.SubscriptionId ?? mySub?.subscriptionID;
    const subQty = mySub?.quantity ?? 0;
    const subPrice = subId ? getSubPrice(subId) : 0;
    const totalPrice = totalQty * subPrice;

    const monthlyPayments = effectiveEmpId === 0 ? [] : payments.filter((p: any) => {
        const pEmpId = Number(p.employeeID ?? p.EmployeeID ?? p.employeeId ?? p.EmployeeId);
        if (pEmpId !== effectiveEmpId) return false;
        const d = new Date(p.paidDate ?? p.PaidDate ?? "");
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const totalPaid = monthlyPayments.reduce((sum: number, p: any) =>
        sum + Number(p.totalAmount ?? p.TotalAmount ?? 0), 0
    );

    const buildPrintEntries = (): MilkEntryDto[] => {
        const actualOrLeave = myEntries.filter(e => e.entryType !== "Other");

        const entryByDate = new Map<string, MilkEntryDto>();
        actualOrLeave.forEach(e => {
            const d = new Date(e.entryDate);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            entryByDate.set(key, e);
        });

        const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
        const lastDay = isCurrentMonth
            ? now.getDate()
            : new Date(selectedYear, selectedMonth, 0).getDate();

        const result: MilkEntryDto[] = [];

        for (let day = 1; day <= lastDay; day++) {
            const key = `${selectedYear}-${selectedMonth}-${day}`;
            const existing = entryByDate.get(key);

            if (existing) {
                result.push(existing);
            } else {
                result.push({
                    milkEntryID: -day,
                    employeeID: effectiveEmpId,
                    entryDate: new Date(selectedYear, selectedMonth - 1, day).toISOString(),
                    entryType: "Leave",
                    quantity: 0,
                    locationID: 0,
                } as MilkEntryDto);
            }
        }

        return result;
    };

    const printEntries = effectiveEmpId === 0 ? [] : buildPrintEntries();

    const leaveEntries = printEntries.filter(e => e.entryType === "Leave");

    const getRowAmount = (entry: MilkEntryDto) =>
        entry.entryType === "Leave" ? 0 : entry.quantity * subPrice;

    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const monthLabel = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
        const empLabel = effectiveEmpName || loggedEmployeeName;
        const subName = getSubName(subId);

        doc.setFillColor(27, 67, 50);
        doc.rect(0, 0, 210, 28, "F");

        // Logo
        const logoBase64 = await getLogoBase64();
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, "JPEG", 14, 5, 18, 18);
            } catch {
                // ignore if image fails to embed
            }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("4K FRESH", logoBase64 ? 36 : 14, 14);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Milk Consumption Report", logoBase64 ? 36 : 14, 22);

        doc.setTextColor(0, 0, 0);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Employee : `, 14, 38);
        doc.setFont("helvetica", "normal");
        doc.text(empLabel, 50, 38);

        doc.setFont("helvetica", "bold");
        doc.text(`Month    : `, 14, 46);
        doc.setFont("helvetica", "normal");
        doc.text(monthLabel, 50, 46);

        doc.setFont("helvetica", "bold");
        doc.text(`Subscription : `, 14, 54);
        doc.setFont("helvetica", "normal");
        doc.text(`${subName} | Daily ${subQty} L | Rs.${subPrice}/L`, 55, 54);

        const summaryY = 62;
        const boxes = [
            { label: "Monthly Payment", value: `Rs.${totalPaid.toFixed(2)}` },
            { label: "Leave Days", value: String(leaveEntries.length) },
            { label: "Total Price", value: `Rs.${totalPrice.toFixed(2)}` },
        ];
        boxes.forEach((box, i) => {
            const x = 14 + i * 62;
            doc.setFillColor(232, 245, 233);
            doc.roundedRect(x, summaryY, 58, 18, 3, 3, "F");
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(27, 67, 50);
            doc.text(box.value, x + 29, summaryY + 8, { align: "center" });
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(box.label, x + 29, summaryY + 14, { align: "center" });
        });

        doc.setTextColor(0, 0, 0);

        const tableRows = printEntries.map(entry => {
            const d = new Date(entry.entryDate);
            const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
            const amount = getRowAmount(entry);
            return [
                dateStr,
                entry.entryType,
                entry.entryType === "Leave" ? "0 L" : `${entry.quantity} L`,
                `Rs.${amount.toFixed(2)}`,
            ];
        });

        tableRows.push([ "Total ","", `${totalQty} L`, `Rs.${totalPrice.toFixed(2)}`]);

        autoTable(doc, {
            startY: summaryY + 26,
            head: [["Date", "Entry Type", "Quantity (L)", "Amount"]],
            body: tableRows,
            headStyles: {
                fillColor: [27, 67, 50],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 10,
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 250, 246] },
            columnStyles: {
                0: { cellWidth: 38 },
                1: { cellWidth: 55 },
                2: { cellWidth: 35 },
                3: { cellWidth: 32 },
            },
            didParseCell: (data) => {
                const lastRow = tableRows.length - 1;
                if (data.row.index === lastRow && data.section === "body") {
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.fillColor = [232, 245, 233];
                    data.cell.styles.textColor = [27, 67, 50];
                }
            },
        });

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Generated on ${new Date().toLocaleDateString("en-IN")} | 4K Fresh Milk Management`,
            105, pageHeight - 8, { align: "center" }
        );

        doc.save(`${empLabel}_${monthLabel}_Consumption.pdf`);
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="container-fluid mt-3 px-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold mb-0">
                            {isAdmin ? "Employee Consumption" : "My Consumption"}
                        </h4>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {isAdmin
                                ? (effectiveEmpId !== 0
                                    ? `${effectiveEmpName} — Monthly milk purchase history`
                                    : "Select an employee to view consumption")
                                : `${loggedEmployeeName} — Monthly milk purchase history`}
                        </div>
                    </div>

                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        {effectiveEmpId !== 0 && myEntries.length > 0 && (
                            <button
                                className="btn fw-semibold px-3 py-2"
                                style={{
                                    background: "#c0392b",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                }}
                                onClick={handleExportPDF}
                            >
                                📄 Export PDF
                            </button>
                        )}

                        <div className="position-relative" ref={pickerRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                                style={{
                                    background: "#1B4332",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.95rem",
                                    minWidth: "180px",
                                    justifyContent: "space-between"
                                }}
                                onClick={() => setShowPicker(p => !p)}
                            >
                                <span>📅</span>
                                <span>{monthNames[selectedMonth - 1]} {selectedYear}</span>
                                <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>▼</span>
                            </button>

                            {showPicker && (
                                <div
                                    className="position-absolute end-0 mt-2 shadow-lg"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "12px",
                                        zIndex: 1050,
                                        width: "280px",
                                        padding: "16px",
                                    }}
                                >
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
                                                <button
                                                    key={m}
                                                    onClick={() => handleMonthSelect(monthNum)}
                                                    disabled={isDisabled}
                                                    style={{
                                                        border: isSelected ? "2px solid #1B4332" : "1px solid #dee2e6",
                                                        borderRadius: "8px",
                                                        padding: "8px 4px",
                                                        fontSize: "0.85rem",
                                                        fontWeight: isSelected ? 700 : 400,
                                                        background: isSelected ? "#1B4332" : isDisabled ? "#f8f9fa" : "#fff",
                                                        color: isSelected ? "#fff" : isDisabled ? "#ced4da" : "#212529",
                                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                                        transition: "all 0.15s ease",
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (!isDisabled && !isSelected)
                                                            (e.currentTarget as HTMLButtonElement).style.background = "#e8f5e9";
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!isDisabled && !isSelected)
                                                            (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                                                    }}
                                                >{m}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Employee Dropdown */}
                {isAdmin && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Select Employee</label>
                        <select
                            className="form-select"
                            style={{ borderRadius: "8px", maxWidth: "400px" }}
                            value={adminEmpId}
                            onChange={(e) => setAdminEmpId(e.target.value === "" ? "" : Number(e.target.value))}
                        >
                            <option value="">-- Select Employee --</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName} (ID: {emp.id})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {isAdmin && effectiveEmpId === 0 ? (
                    <div className="text-center text-muted py-5">
                        <div style={{ fontSize: "3rem" }}>👆</div>
                        <div className="mt-2 fw-semibold">Please select an employee to view consumption</div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-success">₹{totalPaid.toFixed(2)}</div>
                                        <div className="text-muted small">Monthly Payment</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-warning">{leaveEntries.length}</div>
                                        <div className="text-muted small">Leave Days</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-primary">{totalOtherQty}</div>
                                        <div className="text-muted small">Other Qty (in ltrs)</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm"
                                    style={{ background: "#1B4332" }}>
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-white">₹{totalPrice.toFixed(2)}</div>
                                        <div className="text-white small">Total Price This Month</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        {mySub && (
                            <div
                                className="alert d-flex align-items-center gap-2 mb-3"
                                style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}
                            >
                                <span>📋</span>
                                <span>
                                    <strong>Subscription:</strong> {getSubName(subId)} &nbsp;|&nbsp;
                                    <strong>Daily Qty:</strong> {subQty} L &nbsp;|&nbsp;
                                    <strong>Price per Litre:</strong> ₹{subPrice} &nbsp;|&nbsp;
                                    <strong>Status:</strong>{" "}
                                    <span className={`badge ${(mySub?.status ?? "").toLowerCase() === "active"
                                        ? "bg-success" : "bg-secondary"}`}>
                                        {mySub?.status ?? "N/A"}
                                    </span>
                                </span>
                            </div>
                        )}

                        {/* Table */}
                        {loading ? (
                            <Loader text="Loading consumption..." />
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Date</th>
                                            <th>Entry Type</th>
                                            <th>Quantity (L)</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted py-4">
                                                    No entries found for {monthNames[selectedMonth - 1]} {selectedYear}.
                                                </td>
                                            </tr>
                                        ) : (
                                            printEntries.map((entry) => {
                                                const d = new Date(entry.entryDate);
                                                const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
                                                const typeBadge =
                                                    entry.entryType === "Actual" ? "bg-success" :
                                                        entry.entryType === "Leave" ? "bg-warning text-dark" :
                                                            "bg-primary";
                                                const amount = getRowAmount(entry);
                                                return (
                                                    <tr key={entry.milkEntryID}>
                                                        <td>{dateStr}</td>
                                                        <td>
                                                            <span className={`badge ${typeBadge}`}>
                                                                {entry.entryType}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold">
                                                            {entry.entryType === "Leave" ? "0 L" : `${entry.quantity} L`}
                                                        </td>
                                                        <td className="fw-bold">₹{amount.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                            {printEntries.length > 0 && (
                                                <tfoot>
                                                    <tr style={{ background: "#e8f5e9" }}>
                                                        <td colSpan={2} className="fw-bold text-end">Total:</td>
                                                        <td className="fw-bold text-success">{totalQty} L</td>
                                                        <td className="fw-bold text-success">₹{totalPrice.toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default MyConsumption;