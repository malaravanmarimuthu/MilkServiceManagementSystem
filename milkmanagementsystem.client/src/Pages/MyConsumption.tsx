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
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    userid: string;
    firstname: string;
    rolename: string;
}

const MyConsumption: React.FC = () => {
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);

    const [adminEmpId, setAdminEmpId] = useState<number | "">("");
    const [adminSearchTerm, setAdminSearchTerm] = useState("");
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);
    const empDropdownRef = useRef<HTMLDivElement>(null);

    const token = localStorage.getItem("token");
    let isAdmin = false;
    let loggedEmployeeID = 0;
    let loggedEmployeeName = "My";

    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            isAdmin = decoded.rolename?.toLowerCase() === "admin";
            loggedEmployeeID = Number(decoded.userid ?? 0);
            loggedEmployeeName = decoded.firstname ?? "My";
        } catch (error)
        {
            console.error("Invalid token", error);
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
            if (empDropdownRef.current && !empDropdownRef.current.contains(e.target as Node)) {
                setShowEmpDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [entryData, subData, empSubData] = await Promise.all([
                MilkEntryService.getAll(),
                getSubscriptions(),
                getEmployeeSubscriptions(),
            ]);

            setEntries(
                Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []
            );
            setSubscriptions(
                Array.isArray(subData) ? subData : (subData as any)?.$values ?? (subData as any)?.data ?? []
            );
            setEmpSubscriptions(
                Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []
            );

            if (isAdmin) {
                const empRes = await getEmployees();
                const empRaw = empRes?.data;
                const empArr: Employee[] = Array.isArray(empRaw)
                    ? empRaw
                    : empRaw?.$values ?? empRaw?.data ?? [];
                setEmployees(empArr);
            }

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

    const getSubPrice = (subId: number) => {
        const sub = subscriptions.find((s: any) =>
            (s.subscriptionID ?? s.subscriptionId) === subId
        );
        return sub?.pricePerLiter ?? sub?.PricePerLiter ?? 0;
    };

    const getMySubscription = (empId: number) => {
        return empSubscriptions.find((s: any) =>
            Number(s.employeeId ?? s.EmployeeId ?? s.employeeID ?? s.EmployeeID) === empId
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
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthShort = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.mobile}`.toLowerCase();
        const idStr = String(emp.id);
        const term = adminSearchTerm.toLowerCase();
        return fullName.includes(term) || idStr.includes(term);
    });

    const myEntries = effectiveEmpId === 0 ? [] : entries.filter((e: any) => {
        const eEmpId = Number(
            e.employeeID ?? e.EmployeeID ?? e.employeeId ?? e.EmployeeId
        );
        if (eEmpId !== effectiveEmpId) return false;
        const d = new Date(e.entryDate);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const actualEntries = myEntries.filter(e => e.entryType === "Actual");
    const leaveEntries = myEntries.filter(e => e.entryType === "Leave");
    const otherEntries = myEntries.filter(e => e.entryType === "Other");

    const totalActualQty = actualEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalOtherQty = otherEntries.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const totalQty = totalActualQty + totalOtherQty;

    const mySub = getMySubscription(effectiveEmpId);
    const subId = mySub?.subscriptionId ?? mySub?.SubscriptionId ?? mySub?.subscriptionID;
    const subQty = mySub?.quantity ?? 0;
    const subPrice = subId ? getSubPrice(subId) : 0;
    const totalPrice = totalQty * subPrice;

    const dropdownList = filteredEmployees;

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

                    {/* Month Picker */}
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
                                    <button
                                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y - 1)}
                                    >‹</button>
                                    <span className="fw-bold" style={{ color: "#1B4332", fontSize: "1rem" }}>
                                        {pickerYear}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                                        style={{ borderRadius: "6px" }}
                                        onClick={() => setPickerYear(y => y + 1)}
                                        disabled={pickerYear >= currentYear}
                                    >›</button>
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

                {/* Admin — Employee Search Dropdown */}
                {isAdmin && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Select Employee</label>
                        <div className="position-relative" ref={empDropdownRef}>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or employee ID..."
                                    value={adminSearchTerm}
                                    onFocus={() => setShowEmpDropdown(true)}
                                    onClick={() => setShowEmpDropdown(true)}
                                    onChange={(e) => {
                                        setAdminSearchTerm(e.target.value);
                                        setShowEmpDropdown(true);
                                        if (e.target.value === "") setAdminEmpId("");
                                    }}
                                    style={{
                                        borderRadius: "8px",
                                        paddingRight: adminSearchTerm ? "40px" : "12px"
                                    }}
                                />

                                {/* ✕ Clear Button */}
                                {adminSearchTerm && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); 
                                            setAdminSearchTerm("");
                                            setAdminEmpId("");
                                            setShowEmpDropdown(true);
                                        }}
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            border: "none",
                                            background: "transparent",
                                            fontSize: "16px",
                                            color: "#888",
                                            cursor: "pointer",
                                            zIndex: 1100,
                                            lineHeight: 1,
                                            padding: "2px 4px",
                                            borderRadius: "50%",
                                        }}
                                        title="Clear"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Dropdown List */}
                            {showEmpDropdown && dropdownList.length > 0 && (
                                <div
                                    className="position-absolute w-100 shadow-sm"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "8px",
                                        zIndex: 1050,
                                        maxHeight: "220px",
                                        overflowY: "auto",
                                        top: "100%",
                                        left: 0,
                                        marginTop: "4px",
                                    }}
                                >
                                    {dropdownList.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="px-3 py-2"
                                            style={{
                                                cursor: "pointer",
                                                borderBottom: "1px solid #f0f0f0",
                                                background: Number(adminEmpId) === emp.id ? "#e8f5e9" : "#fff",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#f1f8f4")}
                                            onMouseLeave={e => (e.currentTarget.style.background = Number(adminEmpId) === emp.id ? "#e8f5e9" : "#fff")}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); 
                                                setAdminEmpId(emp.id);
                                                setAdminSearchTerm(`${emp.firstName} (ID: ${emp.id})`);
                                                setShowEmpDropdown(false);
                                            }}
                                        >
                                            <span className="fw-semibold">{emp.firstName} </span>
                                            <span className="text-muted ms-2" style={{ fontSize: "0.82rem" }}>
                                                ID: {emp.id}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* No employee selected */}
                {isAdmin && effectiveEmpId === 0 ? (
                    <div className="text-center text-muted py-5">
                        <div style={{ fontSize: "3rem" }}>👆</div>
                        <div className="mt-2 fw-semibold">
                            Please select an employee to view consumption
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="card text-center border-0 shadow-sm">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold text-success">{totalActualQty}</div>
                                        <div className="text-muted small">Actual Received (in ltrs)</div>
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
                                                            entry.entryType === "Leave" ? "bg-warning text-dark" :
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
                                                <td colSpan={2} className="fw-bold text-end">Total Received:</td>
                                                <td className="fw-bold text-success">{totalQty} L</td>
                                            </tr>
                                            {/*<tr style={{ background: "#e8f5e9" }}>*/}
                                            {/*    <td colSpan={2} className="fw-bold text-end">Total Price:</td>*/}
                                            {/*    <td className="fw-bold text-success">₹{totalPrice.toFixed(2)}</td>*/}
                                            {/*</tr>*/}
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