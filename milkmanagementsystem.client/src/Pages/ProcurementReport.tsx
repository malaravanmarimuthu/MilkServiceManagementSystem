/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ReportsService, type ProcurementReportRow, type ProcurementReportMonthlyRow } from "../Services/ReportsService";
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
    const litres = payload.find((p: any) => p.dataKey === "litres")?.value ?? 0;
    const amount = payload.find((p: any) => p.dataKey === "amount")?.value ?? 0;
    return (
        <div style={{
            background: "#fff",
            border: "1px solid #bfe0cc",
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
            <div style={{ fontWeight: 700, color: "#1B4332", fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 13, color: "#1B4332" }}>Procured: <strong>{litres} L</strong></div>
            <div style={{ fontSize: 13, color: "#845ec2" }}>Amount Paid: <strong>₹{amount}</strong></div>
        </div>
    );
};

const ProcurementReport: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
    const [rows, setRows] = useState<ProcurementReportRow[]>([]);
    const [monthlyRows, setMonthlyRows] = useState<ProcurementReportMonthlyRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchReport(); }, [viewMode]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            if (viewMode === "month") {
                const data = await ReportsService.getProcurementReport(monthYear);
                setRows(data);
            } else {
                const data = await ReportsService.getProcurementReport6Months();
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
    const suppliers = Array.from(new Set(rows.map(r => r.employeeName))).sort();

    const getQty = (supplier: string, date: string): number =>
        rows.filter(r => r.employeeName === supplier && r.entryDate === date)
            .reduce((sum, r) => sum + r.quantity, 0);

    const getAmount = (supplier: string, date: string): number =>
        rows.filter(r => r.employeeName === supplier && r.entryDate === date)
            .reduce((sum, r) => sum + r.totalAmount, 0);

    const rowTotalQty = (supplier: string) => dates.reduce((sum, d) => sum + getQty(supplier, d), 0);
    const rowTotalAmount = (supplier: string) => dates.reduce((sum, d) => sum + getAmount(supplier, d), 0);
    const colTotalQty = (date: string) => suppliers.reduce((sum, s) => sum + getQty(s, date), 0);
    const colTotalAmount = (date: string) => suppliers.reduce((sum, s) => sum + getAmount(s, date), 0);
    const grandTotalQty = suppliers.reduce((sum, s) => sum + rowTotalQty(s), 0);
    const grandTotalAmount = suppliers.reduce((sum, s) => sum + rowTotalAmount(s), 0);

    // ----- Last 6 months view -----
    const months = Array.from(new Set(monthlyRows.map(r => r.monthYear))).sort();
    const suppliers6 = Array.from(new Set(monthlyRows.map(r => r.employeeName))).sort();

    const getMonthlyQty = (supplier: string, month: string): number =>
        monthlyRows.find(r => r.employeeName === supplier && r.monthYear === month)?.quantity ?? 0;

    const getMonthlyAmount = (supplier: string, month: string): number =>
        monthlyRows.find(r => r.employeeName === supplier && r.monthYear === month)?.totalAmount ?? 0;

    const rowTotalQty6 = (supplier: string) => months.reduce((sum, m) => sum + getMonthlyQty(supplier, m), 0);
    const rowTotalAmount6 = (supplier: string) => months.reduce((sum, m) => sum + getMonthlyAmount(supplier, m), 0);
    const colTotalQty6 = (month: string) => suppliers6.reduce((sum, s) => sum + getMonthlyQty(s, month), 0);
    const colTotalAmount6 = (month: string) => suppliers6.reduce((sum, s) => sum + getMonthlyAmount(s, month), 0);
    const grandTotalQty6 = suppliers6.reduce((sum, s) => sum + rowTotalQty6(s), 0);
    const grandTotalAmount6 = suppliers6.reduce((sum, s) => sum + rowTotalAmount6(s), 0);

    const chartData = viewMode === "month"
        ? dates.map(d => ({
            dateLabel: formatShortDate(d),
            litres: Number(colTotalQty(d).toFixed(2)),
            amount: Number(colTotalAmount(d).toFixed(2)),
        }))
        : months.map(m => ({
            dateLabel: formatMonthLabel(m),
            litres: Number(colTotalQty6(m).toFixed(2)),
            amount: Number(colTotalAmount6(m).toFixed(2)),
        }));

    const handleExportExcel = () => {
        if (viewMode === "month") {
            const header = ["User", ...dates.map(d => `${d} (L)`), "Total (L)", "Total (₹)"];
            const body = suppliers.map(s => [
                s,
                ...dates.map(d => getQty(s, d)),
                rowTotalQty(s),
                rowTotalAmount(s),
            ]);
            const totalRow = ["Total", ...dates.map(d => colTotalQty(d)), grandTotalQty, grandTotalAmount];

            const sheetData = [header, ...body, totalRow];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Procurement Report");
            XLSX.writeFile(wb, `Procurement_Report_${monthYear}.xlsx`);
        } else {
            const header = ["User", ...months.map(m => `${formatMonthLabel(m)} (L)`), "Total (L)", "Total (₹)"];
            const body = suppliers6.map(s => [
                s,
                ...months.map(m => getMonthlyQty(s, m)),
                rowTotalQty6(s),
                rowTotalAmount6(s),
            ]);
            const totalRow = ["Total", ...months.map(m => colTotalQty6(m)), grandTotalQty6, grandTotalAmount6];

            const sheetData = [header, ...body, totalRow];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Procurement Report (6 Months)");
            const rangeLabel = months.length ? `${months[0]}_to_${months[months.length - 1]}` : "6months";
            XLSX.writeFile(wb, `Procurement_Report_${rangeLabel}.xlsx`);
        }
    };

    const hasData = viewMode === "month" ? rows.length > 0 : monthlyRows.length > 0;

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h4 className="fw-bold mb-0">Procurement Report</h4>
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
                    style={{ background: "#1B4332", color: "#fff", borderRadius: "8px", minWidth: "170px" }}
                    onClick={fetchReport}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Loading...
                        </>
                    ) : (
                        <>
                            <span>🔄</span>
                            Refresh Report
                        </>
                    )}
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
                            Users: {viewMode === "month" ? suppliers.length : suppliers6.length}
                        </span>
                        {viewMode === "month" ? (
                            <>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Procured ({monthYear}): {grandTotalQty.toFixed(2)} L
                                </span>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Amount Paid: ₹{grandTotalAmount.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Months covered: {months.length}
                                </span>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Procured (last {months.length || 6} months): {grandTotalQty6.toFixed(2)} L
                                </span>
                                <span className="fw-semibold" style={{ color: "#1B4332" }}>
                                    Total Amount Paid: ₹{grandTotalAmount6.toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>

                    {(viewMode === "month" ? dates.length > 0 : months.length > 0) && (
                        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                            <h6 className="fw-bold mb-1" style={{ color: "#1B4332" }}>
                                {viewMode === "month" ? "Daily Procurement" : "Monthly Procurement"}
                            </h6>
                            <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                                Green bar = litres procured, Purple bar = amount paid. Hover for exact values.
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
                                        label={{ value: "Litres (L) / Amount (₹)", angle: -90, position: "insideLeft", fontSize: 12, fill: "#1B4332" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,67,50,0.06)" }} />
                                    <Legend verticalAlign="top" height={30} />
                                    <Bar dataKey="litres" name="Litres Procured" fill="#1B4332" radius={[6, 6, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="amount" name="Amount Paid (₹)" fill="#845ec2" radius={[6, 6, 0, 0]} maxBarSize={30} />
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
                                    <th className="text-center">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewMode === "month" ? (
                                    suppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan={dates.length + 3} className="text-center text-muted py-4">
                                                No data for this month.
                                            </td>
                                        </tr>
                                    ) : suppliers.map(s => (
                                        <tr key={s}>
                                            <td className="fw-semibold" style={{ position: "sticky", left: 0, background: "#fff" }}>
                                                {s}
                                            </td>
                                            {dates.map(d => {
                                                const qty = getQty(s, d);
                                                return (
                                                    <td key={d} className="text-center">
                                                        {qty > 0 ? qty : <span className="text-muted">-</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                {rowTotalQty(s).toFixed(2)}
                                            </td>
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                ₹{rowTotalAmount(s).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    suppliers6.length === 0 ? (
                                        <tr>
                                            <td colSpan={months.length + 3} className="text-center text-muted py-4">
                                                No data for the last 6 months.
                                            </td>
                                        </tr>
                                    ) : suppliers6.map(s => (
                                        <tr key={s}>
                                            <td className="fw-semibold" style={{ position: "sticky", left: 0, background: "#fff" }}>
                                                {s}
                                            </td>
                                            {months.map(m => {
                                                const qty = getMonthlyQty(s, m);
                                                return (
                                                    <td key={m} className="text-center">
                                                        {qty > 0 ? qty.toFixed(2) : <span className="text-muted">-</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                {rowTotalQty6(s).toFixed(2)}
                                            </td>
                                            <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                                ₹{rowTotalAmount6(s).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {(viewMode === "month" ? suppliers.length > 0 : suppliers6.length > 0) && (
                                <tfoot>
                                    <tr style={{ background: "#e8f3ec" }}>
                                        <td className="fw-bold" style={{ position: "sticky", left: 0, background: "#e8f3ec" }}>
                                            Total
                                        </td>
                                        {viewMode === "month"
                                            ? dates.map(d => (
                                                <td key={d} className="text-center fw-bold">
                                                    {colTotalQty(d).toFixed(2)}
                                                </td>
                                            ))
                                            : months.map(m => (
                                                <td key={m} className="text-center fw-bold">
                                                    {colTotalQty6(m).toFixed(2)}
                                                </td>
                                            ))}
                                        <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                            {(viewMode === "month" ? grandTotalQty : grandTotalQty6).toFixed(2)}
                                        </td>
                                        <td className="text-center fw-bold" style={{ color: "#1B4332" }}>
                                            ₹{(viewMode === "month" ? grandTotalAmount : grandTotalAmount6).toFixed(2)}
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

export default ProcurementReport;