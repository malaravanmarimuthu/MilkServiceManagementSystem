/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import { ReportsService, type BarChartRow } from "../Services/ReportsService";
import { ExpenseService, type ExpenseDto } from "../Services/ExpenseService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonthLabel = (my: string) => {
    const [y, m] = my.split("-");
    return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};
const currentMonthKey = () => new Date().toISOString().slice(0, 7);

const lastNMonthKeys = (count: number): string[] => {
    const keys: string[] = [];
    const d = new Date();
    d.setDate(1);
    for (let i = count - 1; i >= 0; i--) {
        const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
        keys.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
};

const monthKeysBetween = (start: string, end: string): string[] => {
    const keys: string[] = [];
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
        keys.push(`${y}-${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) { m = 1; y++; }
    }
    return keys;
};

const num = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const monthKeyOf = (v: any): string => {
    if (!v) return "";

    const s = String(v).trim();

    // yyyy-MM-dd
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}`;

    // dd-MM-yyyy
    const dm = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dm) {
        return `${dm[3]}-${dm[2]}`;
    }

    // MM/dd/yyyy
    const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (us) {
        return `${us[3]}-${us[1].padStart(2, "0")}`;
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    return "";
};

const toArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

type RangeMode = "6months" | "12months" | "custom";

interface MonthRow {
    key: string;
    month: string;
    procLitres: number;
    procAmount: number;
    soldLitres: number;
    soldAmount: number;
    expenseAmount: number;
    profit: number;
}

const BarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const row: MonthRow = payload[0].payload;
    return (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: "10px 14px", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}>{label}</div>
            <div style={{ color: "#e76f51" }}>Procurement : <strong>₹{row.procAmount.toFixed(2)}</strong> ({row.procLitres.toFixed(2)} L)</div>
            <div style={{ color: "#2D6A4F" }}>Sales : <strong>₹{row.soldAmount.toFixed(2)}</strong> ({row.soldLitres.toFixed(2)} L)</div>
            <div style={{ color: "#a33" }}>Expenses : <strong>₹{row.expenseAmount.toFixed(2)}</strong></div>
            <div style={{ marginTop: 4, fontWeight: 700, color: row.profit >= 0 ? "#2D6A4F" : "#c0392b" }}>
                Net Profit : ₹{row.profit.toFixed(2)}
            </div>
        </div>
    );
};

const renderBarValueLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
        <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#444">
            ₹{Number(value).toFixed(0)}
        </text>
    );
};

const BarChartReport: React.FC = () => {
    const [rangeMode, setRangeMode] = useState<RangeMode>("6months");
    const [customStart, setCustomStart] = useState(() => lastNMonthKeys(6)[0]);
    const [customEnd, setCustomEnd] = useState(currentMonthKey());

    const [procRows, setProcRows] = useState<BarChartRow[]>([]);
    const [salesRows, setSalesRows] = useState<BarChartRow[]>([]);
    const [expenseRows, setExpenseRows] = useState<ExpenseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    useEffect(() => { fetchAll(); }, [rangeMode]);

    const activeMonthKeys = (): string[] => {
        if (rangeMode === "6months") return lastNMonthKeys(6);
        if (rangeMode === "12months") return lastNMonthKeys(12);
        return monthKeysBetween(customStart, customEnd);
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const monthKeys = activeMonthKeys();
            let combined: BarChartRow[] = [];

            if (rangeMode === "6months") {
                const data = await ReportsService.getBarChartReport("6months");
                combined = toArray(data);
            } else {
                const calls = monthKeys.map(k => ReportsService.getBarChartReport("month", k));
                const resultsPerMonth = await Promise.all(calls);
                combined = resultsPerMonth.flatMap(toArray);
            }

            const expenses = await ExpenseService.getAll();

            setProcRows(combined.filter((r: any) => r.sourceType === "Procurement"));
            setSalesRows(combined.filter((r: any) => r.sourceType === "Sales"));
            setExpenseRows(toArray(expenses));
        } catch (err: any) {
            setProcRows([]);
            setSalesRows([]);
            setExpenseRows([]);
            const backendMsg = err?.response?.data?.message;
            setError(backendMsg ? `Failed to load report: ${backendMsg}` : "Failed to load report. Please check the backend.");
        } finally {
            setLoading(false);
        }
    };

    const monthKeySet = new Set(activeMonthKeys());
    const monthMap = new Map<string, MonthRow>();
    activeMonthKeys().forEach(key => {
        monthMap.set(key, { key, month: formatMonthLabel(key), procLitres: 0, procAmount: 0, soldLitres: 0, soldAmount: 0, expenseAmount: 0, profit: 0 });
    });

    procRows.forEach((r: any) => {
        const key = monthKeyOf(r.entryDate);
        if (!monthKeySet.has(key)) return;
        const e = monthMap.get(key)!;
        e.procLitres += num(r.quantity);
        e.procAmount += num(r.amount);
    });

    salesRows.forEach((r: any) => {
        const key = monthKeyOf(r.entryDate);
        if (!monthKeySet.has(key)) return;
        const e = monthMap.get(key)!;
        e.soldLitres += num(r.quantity);
        e.soldAmount += num(r.amount);
    });

    expenseRows.forEach((r: any) => {
        const key = monthKeyOf(r.expenseDate);
        if (!monthKeySet.has(key)) return;
        const e = monthMap.get(key)!;
        e.expenseAmount += num(r.amount);
    });

    const barData = Array.from(monthMap.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(e => ({ ...e, profit: e.soldAmount - e.procAmount - e.expenseAmount }));

    const monthLocationBreakdown = (monthKey: string) => {
        const map = new Map<string, { litres: number; amount: number }>();
        procRows.filter((r: any) => monthKeyOf(r.entryDate) === monthKey).forEach((r: any) => {
            const loc = r.locationName || "Other";
            const e = map.get(loc) ?? { litres: 0, amount: 0 };
            e.litres += num(r.quantity);
            e.amount += num(r.amount);
            map.set(loc, e);
        });
        return Array.from(map.entries()).sort((a, b) => b[1].litres - a[1].litres);
    };

    const monthExpenseBreakdown = (monthKey: string) => {
        const map = new Map<string, number>();
        expenseRows.filter((r: any) => monthKeyOf(r.expenseDate) === monthKey).forEach((r: any) => {
            map.set(r.expenseType, (map.get(r.expenseType) ?? 0) + num(r.amount));
        });
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    };

    const totalProcAmount = barData.reduce((s, d) => s + d.procAmount, 0);
    const totalSoldAmount = barData.reduce((s, d) => s + d.soldAmount, 0);
    const totalExpenseAmount = barData.reduce((s, d) => s + d.expenseAmount, 0);
    const totalProfit = totalSoldAmount - totalProcAmount - totalExpenseAmount;

    const firstMonth = barData[0];
    const lastMonth = barData[barData.length - 1];
    let growthPct = 0;
    if (firstMonth && lastMonth && firstMonth.profit !== 0) {
        growthPct = ((lastMonth.profit - firstMonth.profit) / Math.abs(firstMonth.profit)) * 100;
    }
    const isGrowthPositive = growthPct >= 0;

    const rangeLabel = rangeMode === "6months" ? "last_6_months" : rangeMode === "12months" ? "last_12_months" : `${customStart}_to_${customEnd}`;

    const handleExportExcel = () => {
        const header = ["Month", "Procurement Litres", "Procurement Amount (₹)", "Sales Litres", "Sales Amount (₹)", "Expenses (₹)", "Net Profit (₹)"];
        const body = barData.map(d => [d.month, d.procLitres.toFixed(2), d.procAmount.toFixed(2), d.soldLitres.toFixed(2), d.soldAmount.toFixed(2), d.expenseAmount.toFixed(2), d.profit.toFixed(2)]);
        const summary = [
            [],
            ["Total Procurement (₹)", totalProcAmount.toFixed(2)],
            ["Total Sales (₹)", totalSoldAmount.toFixed(2)],
            ["Total Expenses (₹)", totalExpenseAmount.toFixed(2)],
            ["Net Profit (₹)", totalProfit.toFixed(2)],
            ["Growth % (first → last month)", `${growthPct.toFixed(2)}%`],
        ];
        const sheetData = [header, ...body, ...summary];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Growth Report");
        XLSX.writeFile(wb, `Growth_Report_${rangeLabel}.xlsx`);
    };

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <h4 className="fw-bold mb-0">Growth Report — Procurement vs Sales vs Expenses</h4>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>Click a month below to see details.</div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn fw-semibold d-flex align-items-center gap-2" style={{ background: "#1B4332", color: "#fff", borderRadius: "8px" }} onClick={fetchAll} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" /> : <span>🔄</span>}
                        Refresh
                    </button>
                    <button className="btn btn-success fw-semibold" onClick={handleExportExcel} disabled={barData.length === 0}>
                        <i className="bi bi-file-earmark-excel me-1" /> Download Excel
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 mb-4 px-3 py-2 rounded-4" style={{ background: "#f4faf6", border: "1px solid #bfe0cc" }}>
                <div className="btn-group" role="group">
                    <button type="button" className={`btn btn-sm fw-semibold ${rangeMode === "6months" ? "btn-success" : "btn-outline-success"}`} onClick={() => setRangeMode("6months")}>Last 6 Months</button>
                    <button type="button" className={`btn btn-sm fw-semibold ${rangeMode === "12months" ? "btn-success" : "btn-outline-success"}`} onClick={() => setRangeMode("12months")}>Last 1 Year</button>
                    <button type="button" className={`btn btn-sm fw-semibold ${rangeMode === "custom" ? "btn-success" : "btn-outline-success"}`} onClick={() => setRangeMode("custom")}>Custom Range</button>
                </div>

                {rangeMode === "custom" && (
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <label className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1B4332" }}>From</label>
                        <input type="month" className="form-control form-control-sm" value={customStart} max={customEnd} onChange={(e) => setCustomStart(e.target.value)} />
                        <label className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1B4332" }}>To</label>
                        <input type="month" className="form-control form-control-sm" value={customEnd} min={customStart} max={currentMonthKey()} onChange={(e) => setCustomEnd(e.target.value)} />
                        <button className="btn btn-sm btn-success fw-semibold" onClick={fetchAll} disabled={loading}>Apply</button>
                    </div>
                )}
            </div>

            {loading ? <Loader text="Loading growth report..." /> : (
                barData.length === 0 ? (
                    <div className="text-center text-muted py-5">No data available.</div>
                ) : (
                    <>
                        <div className="d-flex flex-wrap gap-3 mb-4">
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 200, background: "#fff4f1" }}>
                                <div style={{ fontSize: "0.8rem", color: "#8a5647" }}>Total Procurement</div>
                                <div className="fw-bold" style={{ fontSize: "1.25rem", color: "#e76f51" }}>₹{totalProcAmount.toFixed(2)}</div>
                            </div>
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 200, background: "#eef7ee" }}>
                                <div style={{ fontSize: "0.8rem", color: "#4a7a4a" }}>Total Sales</div>
                                <div className="fw-bold" style={{ fontSize: "1.25rem", color: "#2D6A4F" }}>₹{totalSoldAmount.toFixed(2)}</div>
                            </div>
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 200, background: "#fdeaea" }}>
                                <div style={{ fontSize: "0.8rem", color: "#a33" }}>Total Expenses</div>
                                <div className="fw-bold" style={{ fontSize: "1.25rem", color: "#c0392b" }}>₹{totalExpenseAmount.toFixed(2)}</div>
                            </div>
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 200, background: totalProfit >= 0 ? "#eef7ee" : "#fdeaea" }}>
                                <div style={{ fontSize: "0.8rem", color: totalProfit >= 0 ? "#4a7a4a" : "#a33" }}>Net Profit</div>
                                <div className="fw-bold" style={{ fontSize: "1.25rem", color: totalProfit >= 0 ? "#2D6A4F" : "#c0392b" }}>₹{totalProfit.toFixed(2)}</div>
                            </div>
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 200, background: "#eef2fb" }}>
                                <div style={{ fontSize: "0.8rem", color: "#3d5a8a" }}>Growth (first → last month)</div>
                                <div className="fw-bold" style={{ fontSize: "1.25rem", color: isGrowthPositive ? "#2D6A4F" : "#c0392b" }}>
                                    {isGrowthPositive ? "▲" : "▼"} {Math.abs(growthPct).toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h6 className="fw-bold mb-1" style={{ color: "#1B4332" }}>Month-wise Comparison</h6>
                            <div className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>Value shown above each bar. Hover for full breakdown.</div>
                            <ResponsiveContainer width="100%" height={420}>
                                <BarChart data={barData} margin={{ top: 30, right: 20, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip content={<BarTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                                    <Bar dataKey="procAmount" name="Procurement (₹)" fill="#e76f51" radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="procAmount" content={renderBarValueLabel} />
                                    </Bar>
                                    <Bar dataKey="soldAmount" name="Sales (₹)" fill="#2D6A4F" radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="soldAmount" content={renderBarValueLabel} />
                                    </Bar>
                                    <Bar dataKey="expenseAmount" name="Expenses (₹)" fill="#c0392b" radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="expenseAmount" content={renderBarValueLabel} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h6 className="fw-bold mb-3" style={{ color: "#1B4332" }}>Month Details</h6>
                            {barData.map((d) => {
                                const isOpen = expandedMonth === d.key;
                                return (
                                    <div key={d.key} className="mb-2 border rounded-3" style={{ borderColor: "#e0e6e2" }}>
                                        <div
                                            className="d-flex justify-content-between align-items-center px-3 py-2 flex-wrap gap-2"
                                            style={{ cursor: "pointer", background: isOpen ? "#f4faf6" : "#fff" }}
                                            onClick={() => setExpandedMonth(isOpen ? null : d.key)}
                                        >
                                            <span className="fw-semibold">{d.month}</span>
                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                <span style={{ fontSize: "0.82rem", color: "#e76f51" }}>Proc ₹{d.procAmount.toFixed(2)}</span>
                                                <span style={{ fontSize: "0.82rem", color: "#2D6A4F" }}>Sales ₹{d.soldAmount.toFixed(2)}</span>
                                                <span style={{ fontSize: "0.82rem", color: "#c0392b" }}>Exp ₹{d.expenseAmount.toFixed(2)}</span>
                                                <span className="fw-bold" style={{ fontSize: "0.85rem", color: d.profit >= 0 ? "#2D6A4F" : "#c0392b" }}>
                                                    Profit ₹{d.profit.toFixed(2)}
                                                </span>
                                                <span>{isOpen ? "▲" : "▼"}</span>
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="px-3 py-3" style={{ background: "#fbfdfc", borderTop: "1px solid #e0e6e2" }}>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <div className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "#1B4332" }}>Procurement by Location</div>
                                                        {monthLocationBreakdown(d.key).length === 0 ? (
                                                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>No procurement this month.</div>
                                                        ) : monthLocationBreakdown(d.key).map(([loc, v]) => (
                                                            <div key={loc} className="d-flex justify-content-between" style={{ fontSize: "0.82rem" }}>
                                                                <span>{loc}</span>
                                                                <span className="fw-semibold">{v.litres.toFixed(2)} L / ₹{v.amount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "#1B4332" }}>Expenses by Type</div>
                                                        {monthExpenseBreakdown(d.key).length === 0 ? (
                                                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>No expenses this month.</div>
                                                        ) : monthExpenseBreakdown(d.key).map(([type, amt]) => (
                                                            <div key={type} className="d-flex justify-content-between" style={{ fontSize: "0.82rem" }}>
                                                                <span>{type}</span>
                                                                <span className="fw-semibold">₹{amt.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default BarChartReport;