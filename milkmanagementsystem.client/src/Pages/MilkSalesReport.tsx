/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ReportsService, type MilkReportRow, type MilkReportMonthlyRow } from "../Services/ReportsService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

type ViewMode = "month" | "6months";

const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatShortDate = (isoDate: string) => {
    const [, m, d] = isoDate.split("-");
    return `${d} ${MONTH_NAMES[Number(m) - 1]}`;
};

const formatMonthLabel = (monthYear: string) => {
    const [y, m] = monthYear.split("-");
    return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: "#fff",
            border: "1px solid #bfe0cc",
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
            <div style={{ fontWeight: 700, color: "#1B4332", fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 13, color: "#374151" }}>
                Milk Sold: <strong>{payload[0].value} L</strong>
            </div>
        </div>
    );
};

const MilkSalesReport: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
    const [rows, setRows] = useState<MilkReportRow[]>([]);
    const [monthlyRows, setMonthlyRows] = useState<MilkReportMonthlyRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchReport(); }, [viewMode]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            if (viewMode === "month") {
                const data = await ReportsService.getMilkConsumptionReport(monthYear);
                setRows(data);
            } else {
                const data = await ReportsService.getMilkConsumptionReport6Months();
                setMonthlyRows(data);
            }
        } catch {
            setError("Failed to load report. Please check the backend.");
        } finally {
            setLoading(false);
        }
    };

    // ----- Monthly (day-by-day) view -----
    const dates = Array.from(new Set(rows.map(r => r.entryDate))).sort();

    const userMap = new Map<number, string>();
    rows.forEach(r => userMap.set(r.employeeID, r.employeeName));
    const users = Array.from(userMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));

    const getQty = (empId: number, date: string): number => {
        const entry = rows.find(r => r.employeeID === empId && r.entryDate === date);
        if (!entry || entry.entryType === "Leave") return 0;
        return entry.quantity;
    };

    const rowTotal = (empId: number) => dates.reduce((sum, d) => sum + getQty(empId, d), 0);
    const colTotal = (date: string) => users.reduce((sum, [id]) => sum + getQty(id, date), 0);
    const grandTotal = users.reduce((sum, [id]) => sum + rowTotal(id), 0);

    // ----- Last 6 months view -----
    const months = Array.from(new Set(monthlyRows.map(r => r.monthYear))).sort();

    const userMap6 = new Map<number, string>();
    monthlyRows.forEach(r => userMap6.set(r.employeeID, r.employeeName));
    const users6 = Array.from(userMap6.entries()).sort((a, b) => a[1].localeCompare(b[1]));

    const getMonthlyQty = (empId: number, month: string): number => {
        const entry = monthlyRows.find(r => r.employeeID === empId && r.monthYear === month);
        return entry ? entry.quantity : 0;
    };

    const rowTotal6 = (empId: number) => months.reduce((sum, m) => sum + getMonthlyQty(empId, m), 0);
    const colTotal6 = (month: string) => users6.reduce((sum, [id]) => sum + getMonthlyQty(id, month), 0);
    const grandTotal6 = users6.reduce((sum, [id]) => sum + rowTotal6(id), 0);

    const chartData = viewMode === "month"
        ? dates.map(d => ({ dateLabel: formatShortDate(d), litres: Number(colTotal(d).toFixed(2)) }))
        : months.map(m => ({ dateLabel: formatMonthLabel(m), litres: Number(colTotal6(m).toFixed(2)) }));

    const handleExportExcel = () => {
        if (viewMode === "month") {
            const header = ["User", ...dates, "Total (L)"];
            const body = users.map(([id, name]) => [
                name,
                ...dates.map(d => getQty(id, d)),
                rowTotal(id),
            ]);
            const totalRow = ["Total", ...dates.map(d => colTotal(d)), grandTotal];

            const sheetData = [header, ...body, totalRow];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Milk Sales Report");
            XLSX.writeFile(wb, `Milk_Sales_Report_${monthYear}.xlsx`);
        } else {
            const header = ["User", ...months.map(formatMonthLabel), "Total (L)"];
            const body = users6.map(([id, name]) => [
                name,
                ...months.map(m => getMonthlyQty(id, m)),
                rowTotal6(id),
            ]);
            const totalRow = ["Total", ...months.map(m => colTotal6(m)), grandTotal6];

            const sheetData = [header, ...body, totalRow];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Milk Sales Report (6 Months)");
            const rangeLabel = months.length ? `${months[0]}_to_${months[months.length - 1]}` : "6months";
            XLSX.writeFile(wb, `Milk_Sales_Report_${rangeLabel}.xlsx`);
        }
    };

    const hasData = viewMode === "month" ? rows.length > 0 : monthlyRows.length > 0;

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h4 className="fw-bold mb-0">Milk Sales Report</h4>
                <div className="btn-group" role="group">
                    <button
                        type="button"
                        className={`btn btn-sm fw-semibold ${viewMode === "month" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setViewMode("month")}
                    >
                        This Month
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm fw-semibold ${viewMode === "6months" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setViewMode("6months")}
                    >
                        Last 6 Months
                    </button>
                </div>
            </div>

            <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
                {viewMode === "month" && (
                    <input
                        type="month"
                        className="form-control"
                        value={monthYear}
                        max={getCurrentMonthYear()}
                        onChange={(e) => setMonthYear(e.target.value)}
                    />
                )}
                <button
                    className="btn fw-semibold d-flex align-items-center gap-2"
                    style={{ background: "#1B4332", color: "#fff", borderRadius: "8px" }}
                    onClick={fetchReport}
                    disabled={loading}
                >
                    {loading ? <span className="spinner-border spinner-border-sm" /> : <span>🔄</span>}
                    Refresh Report
                </button>
                <button
                    className="btn btn-success fw-semibold"
                    onClick={handleExportExcel}
                    disabled={!hasData}
                >
                    <i className="bi bi-file-earmark-excel me-1" />
                    Download Excel
                </button>
            </div>

            {loading ? <Loader text="Loading report..." /> : (
                <>
                    <div
                        className="d-flex flex-wrap gap-3 align-items-center mb-3 px-3 py-2 rounded-3"
                        style={{ background: "#e8f3ec", border: "1px solid #bfe0cc" }}
                    >
                        <span className="fw-semibold" style={{ color: "#1B4332" }}>
                            Users: {viewMode === "month" ? users.length : users6.length}
                        </span>
                        {viewMode === "month" ? (
                            <>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Days with entries: {dates.length}
                                </span>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Milk Sold ({monthYear}): {grandTotal.toFixed(2)} L
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Months covered: {months.length}
                                </span>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Milk Sold (last {months.length || 6} months): {grandTotal6.toFixed(2)} L
                                </span>
                            </>
                        )}
                    </div>

                    {(viewMode === "month" ? dates.length > 0 : months.length > 0) && (
                        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                            <h6 className="fw-bold mb-1" style={{ color: "#1B4332" }}>
                                {viewMode === "month" ? "Daily Milk Sales" : "Monthly Milk Sales"}
                            </h6>
                            <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                                Each bar = total litres sold {viewMode === "month" ? "on that date" : "in that month"}. Hover for exact values.
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="dateLabel"
                                        tick={{ fontSize: 11, fill: "#374151" }}
                                        label={{ value: viewMode === "month" ? "Date" : "Month", position: "insideBottom", offset: -12, fontSize: 12, fill: "#1B4332" }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#374151" }}
                                        label={{ value: "Litres (L)", angle: -90, position: "insideLeft", fontSize: 12, fill: "#1B4332" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,67,50,0.06)" }} />
                                    <Legend verticalAlign="top" height={30} />
                                    <Bar dataKey="litres" name="Litres Sold" fill="#1B4332" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-bordered table-sm align-middle" style={{ fontSize: "0.82rem" }}>
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ position: "sticky", left: 0, background: "#212529", zIndex: 2 }}>
                                        User
                                    </th>
                                    {viewMode === "month"
                                        ? dates.map(d => <th key={d} className="text-center">{d.slice(8, 10)}</th>)
                                        : months.map(m => <th key={m} className="text-center">{formatMonthLabel(m)}</th>)}
                                    <th className="text-center">Total (L)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewMode === "month" ? (
                                    users.length === 0 ? (
                                        <tr>
                                            <td colSpan={dates.length + 2} className="text-center text-muted py-4">
                                                No data for this month.
                                            </td>
                                        </tr>
                                    ) : users.map(([id, name]) => (
                                        <tr key={id}>
                                            <td className="fw-semibold" style={{ position: "sticky", left: 0, background: "#fff" }}>
                                                {name}
                                            </td>
                                            {dates.map(d => {
                                                const qty = getQty(id, d);
                                                return (
                                                    <td key={d} className="text-center">
                                                        {qty > 0 ? qty : <span className="text-muted">-</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                {rowTotal(id).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    users6.length === 0 ? (
                                        <tr>
                                            <td colSpan={months.length + 2} className="text-center text-muted py-4">
                                                No data for the last 6 months.
                                            </td>
                                        </tr>
                                    ) : users6.map(([id, name]) => (
                                        <tr key={id}>
                                            <td className="fw-semibold" style={{ position: "sticky", left: 0, background: "#fff" }}>
                                                {name}
                                            </td>
                                            {months.map(m => {
                                                const qty = getMonthlyQty(id, m);
                                                return (
                                                    <td key={m} className="text-center">
                                                        {qty > 0 ? qty.toFixed(2) : <span className="text-muted">-</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                {rowTotal6(id).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {(viewMode === "month" ? users.length > 0 : users6.length > 0) && (
                                <tfoot>
                                    <tr style={{ background: "#e8f3ec" }}>
                                        <td className="fw-bold" style={{ position: "sticky", left: 0, background: "#e8f3ec" }}>
                                            Total
                                        </td>
                                        {viewMode === "month"
                                            ? dates.map(d => (
                                                <td key={d} className="text-center fw-bold">
                                                    {colTotal(d).toFixed(2)}
                                                </td>
                                            ))
                                            : months.map(m => (
                                                <td key={m} className="text-center fw-bold">
                                                    {colTotal6(m).toFixed(2)}
                                                </td>
                                            ))}
                                        <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                            {(viewMode === "month" ? grandTotal : grandTotal6).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default MilkSalesReport;