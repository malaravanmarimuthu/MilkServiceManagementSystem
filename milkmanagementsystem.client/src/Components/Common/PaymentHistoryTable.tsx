/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { PaymentService } from "../../Services/PaymentService";
import type { PaymentDto } from "../../Services/PaymentService";
import { getEmployees } from "../../Services/EmployeeService";
import Loader from "./Loader";
import ErrorModal from "./ErrorModal";

interface Props {
    isAdmin: boolean;
    currentEmployeeID?: number;
}

const PaymentHistoryTable: React.FC<Props> = ({ isAdmin, currentEmployeeID }) => {
    const [payments, setPayments] = useState<PaymentDto[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedEmpID, setSelectedEmpID] = useState<number>(0);

    const getTodayISO = () => new Date().toISOString().split("T")[0];

    const getDefaultFrom = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d.toISOString().split("T")[0];
    };

    const [fromDate, setFromDate] = useState<string>(getDefaultFrom());
    const [toDate, setToDate] = useState<string>(getTodayISO());
    const [fromError, setFromError] = useState("");
    const [toError, setToError] = useState("");

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [payData, empData] = await Promise.all([
                PaymentService.getAll(),
                isAdmin ? getEmployees() : Promise.resolve({ data: [] }),
            ]);
            const payArr = Array.isArray(payData)
                ? payData
                : (payData as any)?.$values ?? [];
            setPayments(payArr);

            if (isAdmin) {
                const empArr = Array.isArray((empData as any).data)
                    ? (empData as any).data
                    : (empData as any).data?.$values ?? [];
                setEmployees(empArr);
            }
        } catch {
            setError("Failed to load payment history.");
        } finally {
            setLoading(false);
        }
    };

    const handleFromChange = (val: string) => {
        setFromError("");
        if (toDate && val > toDate) {
            setFromError("From date cannot be after To date.");
            return;
        }
        setFromDate(val);
    };

    const handleToChange = (val: string) => {
        setToError("");
        if (fromDate && val < fromDate) {
            setToError("To date cannot be before From date.");
            return;
        }
        setToDate(val);
    };

    const filtered = payments
        .filter((p) => {
            const pDate = (p.paidDate ?? "").split("T")[0];
            if (fromDate && pDate < fromDate) return false;
            if (toDate && pDate > toDate) return false;
            if (!isAdmin && p.employeeID !== currentEmployeeID) return false;
            if (isAdmin && selectedEmpID > 0 && p.employeeID !== selectedEmpID) return false;
            return true;
        })
        .sort((a, b) => (b.paidDate ?? "").localeCompare(a.paidDate ?? ""));

    const totalAmount = filtered.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
    const totalQty = filtered.reduce((sum, p) => sum + (p.quantity ?? 0), 0);

    const monthlyMap: Record<string, number> = {};
    filtered.forEach((p) => {
        const month = (p.paidDate ?? "").substring(0, 7);
        monthlyMap[month] = (monthlyMap[month] ?? 0) + (p.totalAmount ?? 0);
    });

    const formatDate = (iso: string) => {
        if (!iso) return "";
        const [y, m, d] = iso.split("T")[0].split("-");
        return `${d}-${m}-${y}`;
    };

    const getEmpName = (id: number) => {
        const emp = employees.find((e: any) => (e.id ?? e.ID) === id);
        return emp
            ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
            : `Emp #${id}`;
    };

    const getMonthLabel = (ym: string) => {
        const [y, m] = ym.split("-");
        return new Date(Number(y), Number(m) - 1).toLocaleString("en-IN", {
            month: "long", year: "numeric"
        });
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div className="row g-3 align-items-end">
                    {isAdmin && (
                        <div className="col-md-4">
                            <label className="form-label fw-semibold small text-muted">
                                EMPLOYEE
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={selectedEmpID}
                                onChange={(e) => setSelectedEmpID(Number(e.target.value))}
                            >
                                <option value={0}>All Employees</option>
                                {employees.map((emp: any) => {
                                    const id = emp.id ?? emp.ID;
                                    const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
                                    return (
                                        <option key={id} value={id}>
                                            {name} (ID: {id})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {/* FROM DATE */}
                    <div className={isAdmin ? "col-md-3" : "col-md-5"}>
                        <label className="form-label fw-semibold small text-muted">
                            FROM DATE
                        </label>
                        <input
                            type="date"
                            className={`form-control form-control-sm ${fromError ? "is-invalid" : ""}`}
                            value={fromDate}
                            max={toDate || getTodayISO()}
                            onChange={(e) => handleFromChange(e.target.value)}
                        />
                        {fromError && (
                            <div className="invalid-feedback">{fromError}</div>
                        )}
                    </div>

                    {/* TO DATE */}
                    <div className={isAdmin ? "col-md-3" : "col-md-5"}>
                        <label className="form-label fw-semibold small text-muted">
                            TO DATE
                        </label>
                        <input
                            type="date"
                            className={`form-control form-control-sm ${toError ? "is-invalid" : ""}`}
                            value={toDate}
                            min={fromDate}
                            max={getTodayISO()}
                            onChange={(e) => handleToChange(e.target.value)}
                        />
                        {toError && (
                            <div className="invalid-feedback">{toError}</div>
                        )}
                    </div>

                    {/* RESET BUTTON */}
                    <div className={isAdmin ? "col-md-2" : "col-md-2"}>
                        <label className="form-label fw-semibold small text-muted d-block">&nbsp;</label>
                        <button
                            className="btn btn-sm btn-outline-secondary w-100"
                            onClick={() => {
                                setFromDate(getDefaultFrom());
                                setToDate(getTodayISO());
                                setFromError("");
                                setToError("");
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Selected range display */}
                <div className="mt-2 text-muted" style={{ fontSize: "0.78rem" }}>
                    <i className="bi bi-calendar-range me-1" />
                    Showing: <strong>{formatDate(fromDate)}</strong> To <strong>{formatDate(toDate)}</strong>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total Paid", value: `Rs. ${totalAmount.toFixed(2)}`, icon: "bi bi-cash-coin", bg: "#1B4332", light: "#e8f5e9" },
                    { label: "Total Quantity", value: `${totalQty.toFixed(1)} L`, icon: "bi bi-droplet-fill", bg: "#1e40af", light: "#dbeafe" },
                    { label: "Transactions", value: String(filtered.length), icon: "bi bi-receipt", bg: "#92400e", light: "#fef3c7" },
                ].map((stat, i) => (
                    <div className="col-md-4" key={i}>
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body d-flex align-items-center gap-3 p-4">
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: stat.light, display: "flex",
                                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <i className={stat.icon} style={{ fontSize: "1.4rem", color: stat.bg }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.bg, lineHeight: 1.1 }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 500 }}>
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Breakdown + Table */}
            <div className="row g-4">
                {Object.keys(monthlyMap).length > 0 && (
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-header border-0 px-4 pt-4 pb-2">
                                <h6 className="fw-bold mb-0" style={{ color: "#1B4332" }}>
                                    <i className="bi bi-calendar3 me-2" />
                                    Monthly Breakdown
                                </h6>
                            </div>
                            <div className="card-body px-4 pb-4">
                                {Object.entries(monthlyMap)
                                    .sort((a, b) => b[0].localeCompare(a[0]))
                                    .map(([month, amt]) => (
                                        <div
                                            key={month}
                                            className="d-flex justify-content-between align-items-center py-2"
                                            style={{ borderBottom: "1px solid #f0f0f0" }}
                                        >
                                            <span style={{ fontSize: "0.88rem", color: "#374151" }}>
                                                {getMonthLabel(month)}
                                            </span>
                                            <span style={{ fontWeight: 700, color: "#1B4332", fontSize: "0.95rem" }}>
                                                Rs. {amt.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className={Object.keys(monthlyMap).length > 0 ? "col-md-8" : "col-12"}>
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div
                            className="card-header border-0 px-4 py-3"
                            style={{ background: "#1B4332" }}
                        >
                            <h6 className="mb-0 fw-bold text-white">
                                <i className="bi bi-list-ul me-2" />
                                Payment Records
                            </h6>
                        </div>

                        {loading ? (
                            <div className="p-4"><Loader /></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead style={{ background: "#f8fafc" }}>
                                        <tr>
                                            {isAdmin && (
                                                <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                                                    Employee
                                                </th>
                                            )}
                                            <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                                                Date
                                            </th>
                                            <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                                                Qty (L)
                                            </th>
                                            <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={isAdmin ? 4 : 3}
                                                    className="text-center text-muted py-5"
                                                >
                                                    <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
                                                    No payment records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((p, i) => (
                                                <tr key={p.paymentID ?? i}>
                                                    {isAdmin && (
                                                        <td style={{ padding: "12px 16px" }}>
                                                            <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                                                                {p.employeeName ?? getEmpName(p.employeeID)}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                                                ID: {p.employeeID}
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td style={{ padding: "12px 16px", fontSize: "0.9rem" }}>
                                                        {formatDate(p.paidDate)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span className="badge" style={{ background: "#dbeafe", color: "#1e40af", fontWeight: 600 }}>
                                                            {p.quantity} L
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span style={{ fontWeight: 700, color: "#1B4332", fontSize: "0.95rem" }}>
                                                            Rs. {p.totalAmount}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {filtered.length > 0 && (
                                        <tfoot>
                                            <tr style={{ background: "#f0fdf4" }}>
                                                {isAdmin && (
                                                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>Total</td>
                                                )}
                                                <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                                                    {!isAdmin && "Total"}
                                                </td>
                                                <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                                                    {totalQty.toFixed(1)} L
                                                </td>
                                                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1B4332" }}>
                                                    Rs. {totalAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentHistoryTable;