/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceService, type InvoiceDto } from "../Services/InvoiceService";
import { LeaveRequestService } from "../Services/LeaveRequestService";
import { getLoggedInEmployeeId } from "../Helpers/getEmployeeId";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import { InvoiceDetailView } from "./Invoice";

const MyBills: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadTarget, setDownloadTarget] = useState<InvoiceDto | null>(null);
    const hiddenDownloadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMyBills();
    }, []);

    const fetchMyBills = async () => {
        const empId = getLoggedInEmployeeId();
        if (!empId) return;
        setLoading(true);
        try {
            const [invData, leaveData] = await Promise.all([
                InvoiceService.getByEmployee(empId),
                LeaveRequestService.getAll(),
            ]);

            const invArr = Array.isArray(invData)
                ? invData
                : (invData as any)?.$values ?? [];
            setInvoices(invArr);

            const leaveArr = Array.isArray(leaveData)
                ? leaveData
                : (leaveData as any)?.$values ?? (leaveData as any)?.data ?? [];
            setLeaveRequests(leaveArr);
        } catch {
            setError("Failed to load your bills. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const toMonthKey = (value: string | null | undefined): string => {
        if (!value) return "";
        const trimmed = value.trim();

        if (/^\d{4}-\d{2}/.test(trimmed)) return trimmed.slice(0, 7);

        const parts = trimmed.split(" ");
        if (parts.length !== 2) return "";
        const [monthName, year] = parts;
        const idx = MONTH_NAMES.findIndex(
            m => m.toLowerCase() === monthName.toLowerCase()
        );
        if (idx === -1 || !/^\d{4}$/.test(year)) return "";
        return `${year}-${String(idx + 1).padStart(2, "0")}`;
    };

    const getLeaveDaysForMonth = (empId: number, monthYear: string): number => {
        const monthKey = toMonthKey(monthYear);
        if (!monthKey) return 0;
        const [yearStr, monthStr] = monthKey.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!year || !month) return 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthStart = `${yearStr}-${monthStr}-01`;
        const monthEnd = `${yearStr}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

        let count = 0;
        leaveRequests.forEach((leave: any) => {
            const leaveEmpId = leave.employeeID ?? leave.employeeId ?? leave.EmployeeId;
            if (leaveEmpId !== empId) return;

            const status = (leave.status ?? leave.Status ?? "").toLowerCase();
            if (status !== "approved") return;

            const fromDate = (leave.fromDate ?? leave.FromDate ?? "").split("T")[0];
            let toDate = (leave.toDate ?? leave.ToDate ?? "").split("T")[0];
            if (!toDate || toDate === "9999-12-31") toDate = monthEnd;

            const overlapStart = fromDate > monthStart ? fromDate : monthStart;
            const overlapEnd = toDate < monthEnd ? toDate : monthEnd;
            if (overlapStart > overlapEnd) return;

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
                if (dateStr >= fromDate && dateStr <= toDate) count++;
            }
        });
        return count;
    };

    const generatePdfFromNode = async (node: HTMLDivElement, invoice: InvoiceDto) => {
        const canvas = await html2canvas(node, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${invoice.invoiceNumber || "Invoice"}.pdf`);
    };

    const downloadInvoiceAsPdf = async (invoice: InvoiceDto) => {
        setDownloadingId(invoice.invoiceID);
        try {
            const node = printRef.current;
            if (!node) throw new Error("Invoice content not ready.");
            await generatePdfFromNode(node, invoice);
            setSuccess(`${invoice.invoiceNumber} downloaded!`);
        } catch {
            setError("Failed to generate PDF. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleRowDownload = (inv: InvoiceDto) => {
        setDownloadingId(inv.invoiceID);
        setDownloadTarget(inv);
    };

    useEffect(() => {
        if (!downloadTarget) return;
        const timer = setTimeout(async () => {
            try {
                const node = hiddenDownloadRef.current;
                if (!node) throw new Error("Invoice content not ready.");
                await generatePdfFromNode(node, downloadTarget);
                setSuccess(`${downloadTarget.invoiceNumber} downloaded!`);
            } catch {
                setError("Failed to generate PDF. Please try again.");
            } finally {
                setDownloadingId(null);
                setDownloadTarget(null);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [downloadTarget]);

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
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />

            <div style={{ position: "fixed", top: 0, left: -99999, opacity: 0, pointerEvents: "none" }}>
                <div ref={hiddenDownloadRef}>
                    {downloadTarget && (
                        <InvoiceDetailView
                            invoice={downloadTarget}
                            noOfLeaves={getLeaveDaysForMonth(downloadTarget.employeeID, downloadTarget.monthYear)}
                        />
                    )}
                </div>
            </div>

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
                                                    disabled={downloadingId === inv.invoiceID}
                                                    onClick={() => handleRowDownload(inv)}
                                                >
                                                    {downloadingId === inv.invoiceID
                                                        ? <span className="spinner-border spinner-border-sm" />
                                                        : <><i className="bi bi-download me-1" />PDF</>
                                                    }
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
                                            disabled={downloadingId === selectedInvoice.invoiceID}
                                            onClick={() => downloadInvoiceAsPdf(selectedInvoice)}
                                        >
                                            {downloadingId === selectedInvoice.invoiceID
                                                ? <span className="spinner-border spinner-border-sm me-1" />
                                                : <i className="bi bi-download me-1" />
                                            }
                                            Download PDF
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
                                <div
                                    className="p-0"
                                    style={{ maxHeight: "80vh", overflowY: "auto" }}
                                    ref={printRef}
                                >
                                    <InvoiceDetailView
                                        invoice={selectedInvoice}
                                        noOfLeaves={getLeaveDaysForMonth(selectedInvoice.employeeID, selectedInvoice.monthYear)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyBills;