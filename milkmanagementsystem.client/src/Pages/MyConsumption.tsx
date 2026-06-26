/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import { getSubscriptions } from "../Services/SubscriptionService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

const MyConsumption: React.FC = () => {
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);

    const getTokenPayload = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;
            return JSON.parse(atob(token.split('.')[1]));
        } catch { return null; }
    };

    const payload = getTokenPayload();
    const employeeID: number = Number(payload?.userid ?? 0);
    const employeeName: string = payload?.firstname ?? "My";

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (showPicker) setPickerYear(selectedYear);
    }, [showPicker]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        if (showPicker) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showPicker]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [entryData, subData, empSubData] = await Promise.all([
                MilkEntryService.getAll(),
                getSubscriptions(),
                getEmployeeSubscriptions(),
            ]);

            const entryArr = Array.isArray(entryData)
                ? entryData
                : (entryData as any)?.$values ?? [];
            setEntries(entryArr);

            const subArr = Array.isArray(subData)
                ? subData
                : (subData as any)?.$values ?? (subData as any)?.data ?? [];
            setSubscriptions(subArr);

            const empSubArr = Array.isArray(empSubData)
                ? empSubData
                : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? [];
            setEmpSubscriptions(empSubArr);

        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const getSubName = (subId: number) => {
        const sub = subscriptions.find((s: any) =>
            (s.subscriptionID ?? s.subscriptionId) === subId
        );
        return sub?.milkType ?? sub?.MilkType ?? "Unknown";
    };

    const getMySubscription = () => {
        return empSubscriptions.find((s: any) =>
            Number(s.employeeId ?? s.EmployeeId ?? s.employeeID ?? s.EmployeeID) === employeeID
        );
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
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const monthShort = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const myEntries = entries.filter((e: any) => {
        const eEmpId = Number(
            e.employeeID ?? e.EmployeeID ?? e.employeeId ?? e.EmployeeId
        );
        if (eEmpId !== employeeID) return false;
        const d = new Date(e.entryDate);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const actualEntries = myEntries.filter(e => e.entryType === "Actual");
    const leaveEntries  = myEntries.filter(e => e.entryType === "Leave");
    const otherEntries  = myEntries.filter(e => e.entryType === "Other");

    const totalActualQty = actualEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalOtherQty  = otherEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalQty       = totalActualQty + totalOtherQty;

    const mySub  = getMySubscription();
    const subId  = mySub?.subscriptionId ?? mySub?.SubscriptionId ?? mySub?.subscriptionID;
    const subQty = mySub?.quantity ?? 0;

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="container-fluid mt-3 px-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold mb-0">My Consumption</h4>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {employeeName} — Monthly milk purchase history
                        </div>
                    </div>

                    {/* Calendar Month Picker */}
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
                                {/* Year Navigator */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <button
                                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y - 1)}
                                    >
                                        ‹
                                    </button>
                                    <span className="fw-bold" style={{ color: "#1B4332", fontSize: "1rem" }}>
                                        {pickerYear}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y + 1)}
                                        disabled={pickerYear >= currentYear}
                                    >
                                        ›
                                    </button>
                                </div>

                                {/* Month Grid */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "8px"
                                    }}
                                >
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
                                                    border: isSelected
                                                        ? "2px solid #1B4332"
                                                        : "1px solid #dee2e6",
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
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="fs-3 fw-bold text-success">{totalActualQty}L</div>
                                <div className="text-muted small">Actual Received</div>
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
                                <div className="fs-3 fw-bold text-primary">{totalOtherQty}L</div>
                                <div className="text-muted small">Other Qty</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card text-center border-0 shadow-sm"
                            style={{ background: "#1B4332" }}>
                            <div className="card-body py-3">
                                <div className="fs-3 fw-bold text-white">{totalQty}L</div>
                                <div className="text-white small">Total This Month</div>
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
                    <Loader text="Loading your consumption..." />
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>Date</th>
                                    <th>Entry Type</th>
                                    <th>Quantity (L)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted py-4">
                                            No entries found for {monthNames[selectedMonth - 1]} {selectedYear}.
                                        </td>
                                    </tr>
                                ) : (
                                    [...myEntries]
                                        .sort((a, b) =>
                                            new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
                                        )
                                        .map((entry) => {
                                            const d = new Date(entry.entryDate);
                                            const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
                                            const typeBadge =
                                                entry.entryType === "Actual" ? "bg-success" :
                                                entry.entryType === "Leave"  ? "bg-warning text-dark" :
                                                "bg-primary";
                                            return (
                                                <tr key={entry.milkEntryID}>
                                                    <td>{dateStr}</td>
                                                    <td>
                                                        <span className={`badge ${typeBadge}`}>
                                                            {entry.entryType}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold">
                                                        {entry.entryType === "Leave"
                                                            ? "—"
                                                            : `${entry.quantity} L`}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                            {myEntries.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: "#f1f8f4" }}>
                                        <td colSpan={2} className="fw-bold text-end">
                                            Total Received:
                                        </td>
                                        <td className="fw-bold text-success">{totalQty} L</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyConsumption;