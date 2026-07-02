import React, { useState, useEffect, useRef } from "react";
import { InvoiceService, type InvoiceDto } from "../Services/InvoiceService";
import { getLoggedInEmployeeId } from "../Helpers/getEmployeeId";
import Loader from "../Components/Common/Loader";
import { InvoiceDetailView } from "./Invoice";

const MyBills: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const [downloadInvoice, setDownloadInvoice] = useState<InvoiceDto | null>(null);
    const downloadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMyBills = async () => {
            const empId = getLoggedInEmployeeId();
            if (!empId) return;
            setLoading(true);
            try {
                const data = await InvoiceService.getByEmployee(empId);
                setInvoices(data);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchMyBills();
    }, []);

    useEffect(() => {
        if (downloadInvoice && downloadRef.current) {
            const content = downloadRef.current;
            const win = window.open("", "_blank");
            if (!win) return;
            win.document.write(`<!DOCTYPE html><html><head>
                <title>${downloadInvoice.invoiceNumber}</title>
                <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family: Arial, sans-serif; }
                    @media print {
                        @page { margin: 15mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head><body>${content.innerHTML}</body></html>`);
            win.document.close();
            win.focus();
            setTimeout(() => {
                win.print();
                win.close();
                setDownloadInvoice(null);
            }, 600);
        }
    }, [downloadInvoice]);

    const handleDownload = (inv: InvoiceDto) => {
        setDownloadInvoice(inv);
    };

    const statusBadge = (s: string) => {
        const cfg: Record<string, { bg: string; color: string; label: string }> = {
            Paid: { bg: "#dcfce7", color: "#15803d", label: "Paid" },
            Partial: { bg: "#fef3c7", color: "#92400e", label: "Partial Paid" },
            Unpaid: { bg: "#fee2e2", color: "#dc2626", label: "Unpaid" },
        };
        const c = cfg[s] ?? { bg: "#f3f4f6", color: "#6b7280", label: s };
        return (
            <span style={{
                background: c.bg, color: c.color,
                padding: "3px 10px", borderRadius: 20,
                fontSize: 12, fontWeight: 700
            }}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "#e8f5e9", display: "flex",
                    alignItems: "center", justifyContent: "center"
                }}>
                    <i className="bi bi-receipt-cutoff"
                        style={{ fontSize: "1.3rem", color: "#1B4332" }} />
                </div>
                <div>
                    <h4 className="fw-bold mb-0">My Bills</h4>
                    <div className="text-muted" style={{ fontSize: "0.84rem" }}>
                        View your milk invoices & payment status
                    </div>
                </div>
            </div>

            {/* Bill List */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header border-0 px-4 py-3" style={{ background: "#1B4332" }}>
                    <h6 className="mb-0 fw-bold text-white">
                        <i className="bi bi-table me-2" />My Invoices
                    </h6>
                </div>
                {loading ? (
                    <div className="p-4"><Loader /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead style={{ background: "#f0fdf4" }}>
                                <tr>
                                    {["Invoice No", "Month / Year", "Amount", "Status", "Action"].map(h => (
                                        <th key={h} style={{
                                            padding: "12px 16px",
                                            fontSize: "0.78rem",
                                            color: "#1B4332",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-5">
                                            <i className="bi bi-inbox"
                                                style={{ fontSize: "2.5rem", display: "block", marginBottom: 8, opacity: 0.4 }} />
                                            No bills generated yet.
                                        </td>
                                    </tr>
                                ) : invoices.map(inv => (
                                    <tr key={inv.invoiceID}>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span className="fw-bold" style={{ color: "#1B4332", fontSize: "0.9rem" }}>
                                                {inv.invoiceNumber}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "#374151" }}>
                                            {inv.monthYear}
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: "0.9rem", fontWeight: 600 }}>
                                            Rs. {(inv.totalAmount + inv.previousArrears).toFixed(2)}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            {statusBadge(inv.status)}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    style={{ fontSize: "0.78rem", borderRadius: 8 }}
                                                    onClick={() => setSelectedInvoice(inv)}
                                                >
                                                    <i className="bi bi-eye me-1" />View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    style={{ fontSize: "0.78rem", borderRadius: 8 }}
                                                    onClick={() => handleDownload(inv)}
                                                >
                                                    <i className="bi bi-download me-1" />PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invoice Detail — modal popup */}
            {selectedInvoice && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.6)" }}
                        onClick={() => setSelectedInvoice(null)}
                    />
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="d-flex justify-content-between align-items-center px-4 py-3"
                                    style={{ background: "#1B4332" }}>
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="bi bi-file-earmark-text me-2" />
                                        {selectedInvoice.invoiceNumber} — Full Details
                                    </h6>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm fw-semibold"
                                            style={{ background: "#e8f5e9", color: "#1B4332", borderRadius: 8 }}
                                            onClick={() => handleDownload(selectedInvoice)}
                                        >
                                            <i className="bi bi-printer me-1" />Print / PDF
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-light"
                                            style={{ borderRadius: 8 }}
                                            onClick={() => setSelectedInvoice(null)}
                                        >
                                            <i className="bi bi-x-lg" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-0" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                                    <InvoiceDetailView invoice={selectedInvoice} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Hidden container for PDF download */}
            {downloadInvoice && (
                <div style={{ position: "absolute", left: "-9999px", top: 0 }} ref={downloadRef}>
                    <InvoiceDetailView invoice={downloadInvoice} />
                </div>
            )}
        </div>
    );
};

export default MyBills;