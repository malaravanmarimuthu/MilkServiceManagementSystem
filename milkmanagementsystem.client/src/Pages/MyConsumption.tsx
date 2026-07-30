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

type FilterMode = "month" | "range";

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

const toDateOnly = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
};

const toInputDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const dateKeyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

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
        } catch (error) {
            console.log(error);
        }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const todayStr = toInputDateStr(now);

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [filterMode, setFilterMode] = useState<FilterMode>("month");
    const [fromDate, setFromDate] = useState<string>(toInputDateStr(new Date(currentYear, currentMonth - 1, 1)));
    const [toDate, setToDate] = useState<string>(todayStr);
    const [rangeError, setRangeError] = useState("");

    const effectiveEmpId = isAdmin
        ? (adminEmpId !== "" ? Number(adminEmpId) : 0)
        : loggedEmployeeID;

    const effectiveEmpName = isAdmin
        ? (adminEmpId !== ""
            ? (() => {
                const emp = employees.find(e => e.id === Number(adminEmpId));
                return emp ? `${emp.firstName} ${emp.mobile}` : "Selected User";
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

    useEffect(() => {
        if (filterMode !== "range") { setRangeError(""); return; }
        if (!fromDate || !toDate) { setRangeError(""); return; }
        if (new Date(fromDate) > new Date(toDate)) {
            setRangeError("From date must be before or equal to To date.");
        } else if (new Date(toDate) > new Date(todayStr)) {
            setRangeError("To date cannot be in the future.");
        } else {
            setRangeError("");
        }
    }, [fromDate, toDate, filterMode]);

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

    const getEffectiveRange = (): { start: Date; end: Date } => {
        if (filterMode === "range" && fromDate && toDate && !rangeError) {
            const start = toDateOnly(new Date(fromDate));
            let end = toDateOnly(new Date(toDate));
            const today = toDateOnly(now);
            if (end > today) end = today;
            return { start, end };
        }
        const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
        const start = toDateOnly(new Date(selectedYear, selectedMonth - 1, 1));
        const end = isCurrentMonth
            ? toDateOnly(now)
            : toDateOnly(new Date(selectedYear, selectedMonth, 0));
        return { start, end };
    };

    const { start: rangeStart, end: rangeEnd } = getEffectiveRange();

    const myEntries = effectiveEmpId === 0 ? [] : entries.filter((e: any) => {
        const eEmpId = Number(e.employeeID ?? e.EmployeeID ?? e.employeeId ?? e.EmployeeId);
        if (eEmpId !== effectiveEmpId) return false;
        const d = toDateOnly(new Date(e.entryDate));
        return d >= rangeStart && d <= rangeEnd;
    });

    const actualEntries = myEntries.filter(e => e.entryType === "Actual");
    const otherEntries = myEntries.filter(e => e.entryType === "Other");

    const totalActualQty = actualEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalOtherQty = otherEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalQty = Math.round((totalActualQty + totalOtherQty) * 100) / 100;

    const mySub = getMySubscription(effectiveEmpId);
    const subId = mySub?.subscriptionId ?? mySub?.SubscriptionId ?? mySub?.subscriptionID;
    const subQty = mySub?.quantity ?? 0;
    const subPrice = subId ? getSubPrice(subId) : 0;
    const totalPrice = totalQty * subPrice;

    const monthlyPayments = effectiveEmpId === 0 ? [] : payments.filter((p: any) => {
        const pEmpId = Number(p.employeeID ?? p.EmployeeID ?? p.employeeId ?? p.EmployeeId);
        if (pEmpId !== effectiveEmpId) return false;
        const d = toDateOnly(new Date(p.paidDate ?? p.PaidDate ?? ""));
        return d >= rangeStart && d <= rangeEnd;
    });

    const totalPaid = monthlyPayments.reduce((sum: number, p: any) =>
        sum + Number(p.totalAmount ?? p.TotalAmount ?? 0), 0
    );

    const paidByDate = new Map<string, number>();
    monthlyPayments.forEach((p: any) => {
        const d = new Date(p.paidDate ?? p.PaidDate ?? "");
        const key = dateKeyOf(d);
        const amt = Number(p.totalAmount ?? p.TotalAmount ?? 0);
        paidByDate.set(key, (paidByDate.get(key) ?? 0) + amt);
    });

    const getRowPaid = (entry: MilkEntryDto) => {
        const d = new Date(entry.entryDate);
        return paidByDate.get(dateKeyOf(d)) ?? 0;
    };

    const pendingAmount = Math.max(totalPrice - totalPaid, 0);
    const isFullyPaid = pendingAmount <= 0;

    const buildPrintEntries = (): MilkEntryDto[] => {
        const entryByDate = new Map<string, MilkEntryDto>();
        myEntries.forEach(e => {
            const d = new Date(e.entryDate);
            const key = dateKeyOf(d);
            entryByDate.set(key, e);
        });

        const result: MilkEntryDto[] = [];
        const cur = new Date(rangeStart);
        let idx = 0;

        while (cur <= rangeEnd) {
            const key = dateKeyOf(cur);
            const existing = entryByDate.get(key);

            if (existing) {
                result.push(existing);
            } else {
                idx++;
                result.push({
                    milkEntryID: -idx,
                    employeeID: effectiveEmpId,
                    entryDate: new Date(cur).toISOString(),
                    entryType: "Leave",
                    quantity: 0,
                    locationID: 0,
                } as MilkEntryDto);
            }
            cur.setDate(cur.getDate() + 1);
        }

        return result;
    };

    const printEntries = effectiveEmpId === 0 ? [] : buildPrintEntries();

    const leaveEntries = printEntries.filter(e => e.entryType === "Leave");

    const getRowAmount = (entry: MilkEntryDto) =>
        entry.entryType === "Leave" ? 0 : entry.quantity * subPrice;

    const formatDDMMYYYY = (d: Date) =>
        `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;

    const periodLabel = filterMode === "range" && fromDate && toDate && !rangeError
        ? `${formatDDMMYYYY(rangeStart)} to ${formatDDMMYYYY(rangeEnd)}`
        : `${monthNames[selectedMonth - 1]} ${selectedYear}`;

    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const monthLabel = periodLabel;
        const empLabel = effectiveEmpName || loggedEmployeeName;
        const subName = getSubName(subId);

        doc.setFillColor(27, 67, 50);
        doc.rect(0, 0, 210, 28, "F");

        const logoBase64 = await getLogoBase64();
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, "JPEG", 14, 5, 18, 18);
            } catch (err) {
                console.error(err);
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
        doc.text(filterMode === "range" ? `Period   : ` : `Month    : `, 14, 46);
        doc.setFont("helvetica", "normal");
        doc.text(monthLabel, 50, 46);

        doc.setFont("helvetica", "bold");
        doc.text(`Subscription : `, 14, 54);
        doc.setFont("helvetica", "normal");
        doc.text(`${subName} | Daily ${subQty} L | Rs.${subPrice}/L`, 55, 54);

        const summaryY = 62;
        const boxes = [
            { label: "Amount Paid", value: `Rs.${totalPaid.toFixed(2)}` },
            { label: "Total Amount", value: `Rs.${totalPrice.toFixed(2)}` },
            { label: `Leave Days (${monthLabel})`, value: String(leaveEntries.length) },
            { label: "Pending Amount", value: `Rs.${pendingAmount.toFixed(2)}` },
        ];
        boxes.forEach((box, i) => {
            const x = 14 + i * 46;
            const isPending = box.label === "Pending Amount";
            doc.setFillColor(isPending ? 253 : 232, isPending ? 234 : 245, isPending ? 234 : 233);
            doc.roundedRect(x, summaryY, 44, 18, 3, 3, "F");
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            if (isPending) doc.setTextColor(139, 0, 0);
            else doc.setTextColor(27, 67, 50);
            doc.text(box.value, x + 22, summaryY + 8, { align: "center" });
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(box.label, x + 22, summaryY + 14, { align: "center" });
        });

        doc.setTextColor(0, 0, 0);

        const tableRows = printEntries.map(entry => {
            const d = new Date(entry.entryDate);
            const dateStr = formatDDMMYYYY(d);
            const amount = getRowAmount(entry);
            const paid = getRowPaid(entry);
            return [
                dateStr,
                entry.entryType,
                entry.entryType === "Leave" ? "0 L" : `${entry.quantity} L`,
                `Rs.${amount.toFixed(2)}`,
                paid > 0 ? `Rs.${paid.toFixed(2)}` : "-",
            ];
        });

        tableRows.push(["Total ", "", `${totalQty} L`, `Rs.${totalPrice.toFixed(2)}`, `Rs.${totalPaid.toFixed(2)}`]);

        autoTable(doc, {
            startY: summaryY + 26,
            head: [["Date", "Entry Type", "Quantity (L)", "Amount", "Paid Amount"]],
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
                0: { cellWidth: 32 },
                1: { cellWidth: 42 },
                2: { cellWidth: 28 },
                3: { cellWidth: 28 },
                4: { cellWidth: 30 },
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

        doc.save(`${empLabel}_${monthLabel.replace(/\s+/g, "_")}_Consumption.pdf`);
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="container-fluid mt-3 px-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold mb-0">
                            {isAdmin ? "User Consumption" : "My Consumption"}
                        </h4>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {isAdmin
                                ? (effectiveEmpId !== 0
                                    ? `${effectiveEmpName} — Milk purchase history`
                                    : "Select an User to view consumption")
                                : `${loggedEmployeeName} — Milk purchase history`}
                        </div>
                    </div>

                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        {effectiveEmpId !== 0 && myEntries.length > 0 && !rangeError && (
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

                        {/* Mode toggle: Month vs Custom Range */}
                        <div
                            className="d-flex"
                            style={{
                                background: "#e9ecef",
                                borderRadius: "8px",
                                padding: "3px",
                            }}
                        >
                            <button
                                className="btn btn-sm fw-semibold"
                                style={{
                                    borderRadius: "6px",
                                    border: "none",
                                    background: filterMode === "month" ? "#1B4332" : "transparent",
                                    color: filterMode === "month" ? "#fff" : "#495057",
                                    padding: "6px 12px",
                                }}
                                onClick={() => setFilterMode("month")}
                            >
                                Month
                            </button>
                            <button
                                className="btn btn-sm fw-semibold"
                                style={{
                                    borderRadius: "6px",
                                    border: "none",
                                    background: filterMode === "range" ? "#1B4332" : "transparent",
                                    color: filterMode === "range" ? "#fff" : "#495057",
                                    padding: "6px 12px",
                                }}
                                onClick={() => setFilterMode("range")}
                            >
                                Custom Range
                            </button>
                        </div>

                        {filterMode === "month" ? (
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
                        ) : (
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className="d-flex align-items-center gap-1">
                                    <label className="small text-muted mb-0">From</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        style={{ borderRadius: "8px" }}
                                        value={fromDate}
                                        max={todayStr}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <label className="small text-muted mb-0">To</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        style={{ borderRadius: "8px" }}
                                        value={toDate}
                                        max={todayStr}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {filterMode === "range" && rangeError && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
                        {rangeError}
                    </div>
                )}

                {isAdmin && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Select User</label>
                        {loading ? (
                            <div
                                className="d-flex justify-content-center align-items-center w-100"
                                style={{ minHeight: "100px" }}
                            >
                                <Loader text="Loading users..." />
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                style={{ borderRadius: "8px", maxWidth: "400px" }}
                                value={adminEmpId}
                                onChange={(e) => setAdminEmpId(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">-- Select User --</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} (ID: {emp.id})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {isAdmin && effectiveEmpId === 0 ? (
                    <div className="text-center text-muted py-5">
                        <div style={{ fontSize: "3rem" }}>👆</div>
                        <div className="mt-2 fw-semibold">Please select an user to view consumption</div>
                    </div>
                ) : rangeError ? (
                    <div className="text-center text-muted py-5">
                        <div style={{ fontSize: "3rem" }}>⚠️</div>
                        <div className="mt-2 fw-semibold">Please fix the selected date range</div>
                    </div>
                ) : (
                    <>
                                <div className="row g-3 mb-4">
                                    <div className="col-6 col-md-3">
                                        <div className="card text-center border-0 shadow-sm h-100"
                                            style={{ background: "#1B4332" }}>
                                            <div className="card-body py-3">
                                                <div className="fs-3 fw-bold text-white">₹{totalPaid.toFixed(2)}</div>
                                                <div className="text-white small">Amount Paid</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="col-6 col-md-3">
                                        <div className="card text-center border-0 shadow-sm h-100"
                                            style={{ background: "#1B4332" }}>
                                            <div className="card-body py-3">
                                                <div className="fs-3 fw-bold text-white">₹{totalPrice.toFixed(2)}</div>
                                                <div className="text-white small">Total Amount ({periodLabel})</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leave Days */}
                                    <div className="col-6 col-md-3">
                                        <div className="card text-center border-0 shadow-sm h-100">
                                            <div className="card-body py-3">
                                                <div className="fs-3 fw-bold text-warning">{leaveEntries.length}</div>
                                                <div className="text-muted small">Leave Days ({periodLabel})</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Amount */}
                                    <div className="col-6 col-md-3">
                                        <div
                                            className="card text-center border-0 shadow-sm h-100"
                                            style={{
                                                background: "#fdeaea",
                                                border: "1px solid #f5b5b5",
                                            }}
                                        >
                                            <div className="card-body py-3">
                                                <div
                                                    className="fs-3 fw-bold"
                                                    style={{ color: "#6b0000" }}
                                                >
                                                    ₹{pendingAmount.toFixed(2)}
                                                </div>
                                                <div className="small" style={{ color: "#6b0000" }}>
                                                    {isFullyPaid ? "✅ Fully Paid" : "⚠️ Pending Amount"}
                                                </div>
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
                                            <th>Total Amount</th>
                                            <th>Paid Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-4">
                                                    No entries found for {periodLabel}.
                                                </td>
                                            </tr>
                                        ) : (
                                            printEntries.map((entry) => {
                                                const d = new Date(entry.entryDate);
                                                const dateStr = formatDDMMYYYY(d);
                                                const typeBadge =
                                                    entry.entryType === "Actual" ? "bg-success" :
                                                        entry.entryType === "Leave" ? "bg-warning text-dark" :
                                                            "bg-primary";
                                                const amount = getRowAmount(entry);
                                                const paid = getRowPaid(entry);
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
                                                        <td className="fw-bold text-success">
                                                            {paid > 0 ? `₹${paid.toFixed(2)}` : "—"}
                                                        </td>
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
                                                <td className="fw-bold text-success">₹{totalPaid.toFixed(2)}</td>
                                            </tr>
                                            <tr style={{ background: isFullyPaid ? "#e8f5e9" : "#fdeaea" }}>
                                                <td colSpan={3} className="fw-bold text-end">
                                                    {isFullyPaid ? "Fully Paid:" : "Pending:"}
                                                </td>
                                                <td colSpan={2} className="fw-bold" style={{ color: isFullyPaid ? "#1B4332" : "#8b0000" }}>
                                                    ₹{pendingAmount.toFixed(2)}
                                                </td>
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