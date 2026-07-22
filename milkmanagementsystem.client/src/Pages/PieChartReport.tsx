/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ReportsService, type PieChartRow } from "../Services/ReportsService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";

type ViewMode = "month" | "6months" | "custom";

const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

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

const toArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

const buildGradientColors = (count: number) => {
    const stops = [
        [190, 40, 70], [230, 100, 60], [235, 180, 70], [150, 195, 90],
        [90, 180, 120], [70, 190, 175], [90, 170, 210], [110, 130, 220],
        [150, 110, 220], [180, 90, 200],
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        const t = (i / Math.max(count - 1, 1)) * (stops.length - 1);
        const idx = Math.floor(t);
        const frac = t - idx;
        const a = stops[idx];
        const b = stops[Math.min(idx + 1, stops.length - 1)];
        const r = Math.round(a[0] + (b[0] - a[0]) * frac);
        const g = Math.round(a[1] + (b[1] - a[1]) * frac);
        const bl = Math.round(a[2] + (b[2] - a[2]) * frac);
        colors.push(`rgb(${r}, ${g}, ${bl})`);
    }
    return colors;
};

const RADIAN = Math.PI / 180;

const renderPercentLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, payload } = props;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = payload?.percent ?? 0;
    return (
        <text x={x} y={y} fill="#3a3a3a" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={600}>
            {pct.toFixed(2)}%
        </text>
    );
};

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: "10px 14px", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 700, color: "#333" }}>{d.label}</div>
            <div>Milk Sold : <strong>{d.litres.toFixed(2)} L</strong></div>
            <div>Amount : <strong>₹{d.amount.toFixed(2)}</strong></div>
            <div>Share : <strong>{d.percent.toFixed(2)}%</strong></div>
        </div>
    );
};

const PieChartReport: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("6months");
    const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
    const [customStart, setCustomStart] = useState(() => lastNMonthKeys(6)[0]);
    const [customEnd, setCustomEnd] = useState(getCurrentMonthYear());
    const [rows, setRows] = useState<PieChartRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchReport(); }, [viewMode]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let data: any;

            if (viewMode === "month") {
                data = await ReportsService.getPieChartReport("month", monthYear);
                data = toArray(data);
            } else if (viewMode === "6months") {
                data = await ReportsService.getPieChartReport("6months");
                data = toArray(data);
            } else {
                const keys = monthKeysBetween(customStart, customEnd);
                const results = await Promise.all(keys.map(k => ReportsService.getPieChartReport("month", k)));
                data = results.flatMap(toArray);
            }

            const active = data.filter((r: any) => r.entryType !== "Leave" && Number(r.quantity) > 0);
            setRows(active);
        } catch (err: any) {
            setRows([]);
            const backendMsg = err?.response?.data?.message;
            setError(backendMsg ? `Failed to load report: ${backendMsg}` : "Failed to load report. Please check the backend.");
        } finally {
            setLoading(false);
        }
    };

    const grouped = new Map<string, { litres: number; amount: number }>();
    rows.forEach(r => {
        const key = r.locationName || "Other";
        const e = grouped.get(key) ?? { litres: 0, amount: 0 };
        e.litres += Number(r.quantity);
        e.amount += Number(r.totalAmount);
        grouped.set(key, e);
    });

    const totalLitres = Array.from(grouped.values()).reduce((s, v) => s + v.litres, 0);
    const totalAmount = Array.from(grouped.values()).reduce((s, v) => s + v.amount, 0);

    const sortedKeys = Array.from(grouped.keys()).sort((a, b) => grouped.get(b)!.litres - grouped.get(a)!.litres);
    const colors = buildGradientColors(sortedKeys.length);

    const pieData = sortedKeys.map((key, i) => ({
        key,
        label: key,
        litres: grouped.get(key)!.litres,
        amount: grouped.get(key)!.amount,
        percent: totalLitres > 0 ? (grouped.get(key)!.litres / totalLitres) * 100 : 0,
        value: Number(grouped.get(key)!.litres.toFixed(2)),
        fill: colors[i],
    }));

    const highest = pieData[0];
    const lowest = pieData[pieData.length - 1];

    const handleExportExcel = () => {
        const header = ["Location", "Litres Sold", "Amount (₹)", "Share (%)"];
        const body = pieData.map(d => [d.label, d.litres.toFixed(2), d.amount.toFixed(2), d.percent.toFixed(2)]);
        const summary = [[], ["Total", totalLitres.toFixed(2), totalAmount.toFixed(2), "100.00"]];
        const sheetData = [header, ...body, ...summary];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Milk Sold by Location");
        const label = viewMode === "month" ? monthYear : viewMode === "6months" ? "last_6_months" : `${customStart}_to_${customEnd}`;
        XLSX.writeFile(wb, `Milk_Sold_By_Location_${label}.xlsx`);
    };

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <ErrorModal message={error} onClose={() => setError("")} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <h4 className="fw-bold mb-0">Milk Sold — By Location</h4>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Which location we deliver / sell the most & least milk to.
                    </div>
                </div>
                <div className="btn-group" role="group">
                    <button type="button" className={`btn btn-sm fw-semibold ${viewMode === "month" ? "btn-success" : "btn-outline-success"}`} onClick={() => setViewMode("month")}>This Month</button>
                    <button type="button" className={`btn btn-sm fw-semibold ${viewMode === "6months" ? "btn-success" : "btn-outline-success"}`} onClick={() => setViewMode("6months")}>Last 6 Months</button>
                    <button type="button" className={`btn btn-sm fw-semibold ${viewMode === "custom" ? "btn-success" : "btn-outline-success"}`} onClick={() => setViewMode("custom")}>Custom Range</button>
                </div>
            </div>

            <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
                {viewMode === "month" && (
                    <input type="month" className="form-control" value={monthYear} max={getCurrentMonthYear()} onChange={(e) => setMonthYear(e.target.value)} />
                )}
                {viewMode === "custom" && (
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <label className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1B4332" }}>From</label>
                        <input type="month" className="form-control form-control-sm" value={customStart} max={customEnd} onChange={(e) => setCustomStart(e.target.value)} />
                        <label className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1B4332" }}>To</label>
                        <input type="month" className="form-control form-control-sm" value={customEnd} min={customStart} max={getCurrentMonthYear()} onChange={(e) => setCustomEnd(e.target.value)} />
                    </div>
                )}
                <button className="btn fw-semibold d-flex align-items-center gap-2" style={{ background: "#1B4332", color: "#fff", borderRadius: "8px" }} onClick={fetchReport} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : <span>🔄</span>}
                    {viewMode === "custom" ? "Apply / Refresh" : "Refresh"}
                </button>
                <button className="btn btn-success fw-semibold" onClick={handleExportExcel} disabled={pieData.length === 0}>
                    <i className="bi bi-file-earmark-excel me-1" /> Download Excel
                </button>
            </div>

            {loading ? <Loader text="Loading report..." /> : (
                pieData.length === 0 ? (
                    <div className="text-center text-muted py-5">No data available.</div>
                ) : (
                    <>
                        <div className="d-flex flex-wrap gap-3 mb-4">
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 220, background: "#eef7ee" }}>
                                <div style={{ fontSize: "0.8rem", color: "#4a7a4a" }}>Highest — Sold the most here</div>
                                <div className="fw-bold" style={{ fontSize: "1.15rem", color: "#2D6A4F" }}>
                                    {highest?.label} — {highest?.litres.toFixed(2)} L ({highest?.percent.toFixed(2)}%)
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm rounded-4 p-3 flex-fill" style={{ minWidth: 220, background: "#fdeaea" }}>
                                <div style={{ fontSize: "0.8rem", color: "#a33" }}>Lowest — Sold the least here</div>
                                <div className="fw-bold" style={{ fontSize: "1.15rem", color: "#c0392b" }}>
                                    {lowest?.label} — {lowest?.litres.toFixed(2)} L ({lowest?.percent.toFixed(2)}%)
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <div className="d-flex flex-wrap align-items-center" style={{ gap: 24 }}>
                                <div style={{ flexShrink: 0 }}>
                                    <ResponsiveContainer width={460} height={460}>
                                        <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="label"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={165}
                                                paddingAngle={1.2}
                                                startAngle={90}
                                                endAngle={-270}
                                                label={renderPercentLabel}
                                                labelLine={{ stroke: "#c7c7c7", strokeWidth: 1 }}
                                                isAnimationActive={false}
                                            >
                                                {pieData.map((d, i) => <Cell key={i} fill={d.fill} stroke="#fff" strokeWidth={2} />)}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ flex: "1 1 220px", minWidth: 220, maxHeight: 460, overflowY: "auto" }}>
                                    {pieData.map((d, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between gap-2 mb-2 px-2 py-1 rounded-3" style={{ background: i === 0 ? "#eef7ee" : "transparent" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ width: 14, height: 14, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                                                <span style={{ fontSize: "0.85rem", color: "#333" }}>{d.label}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1B4332" }}>{d.litres.toFixed(2)} L</span>
                                                <span style={{ fontSize: "0.78rem", color: "#777" }}>({d.percent.toFixed(2)}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default PieChartReport;