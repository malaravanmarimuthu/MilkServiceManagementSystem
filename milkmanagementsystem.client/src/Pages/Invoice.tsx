/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { InvoiceService, type InvoiceDto, type CreateInvoiceRequest, } from "../Services/InvoiceService";
import { getEmployees } from "../Services/EmployeeService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";

const Invoice: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const [form, setForm] = useState<CreateInvoiceRequest>({
        employeeID: 0,
        monthYear: currentMonthYear,
        previousArrears: 0,
        notes: "",
    });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [invData, empData] = await Promise.all([
                InvoiceService.getAll(),
                getEmployees(),
            ]);
            const invArr = Array.isArray(invData)
                ? invData
                : (invData as any)?.$values ?? [];
            setInvoices(invArr);

            const empArr = Array.isArray((empData as any).data)
                ? (empData as any).data
                : (empData as any).data?.$values ?? [];
            setEmployees(empArr);
        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeChange = async (empId: number) => {
        setForm(f => ({ ...f, employeeID: empId, previousArrears: 0 }));
        if (empId > 0) {
            try {
                const balance = await InvoiceService.getLastBalance(empId);
                setForm(f => ({ ...f, employeeID: empId, previousArrears: balance }));
            } catch {
                // no previous invoice
            }
        }
    };

    const handleGenerate = async () => {
        if (!form.employeeID) return setError("Please select an employee.");
        if (!form.monthYear) return setError("Please select month & year.");

        setGenLoading(true);
        try {
            const inv = await InvoiceService.create(form);
            setSuccess(`Invoice ${inv.invoiceNumber} generated successfully!`);
            setSelectedInvoice(inv);
            setShowForm(false);
            fetchAll();
        } catch {
            setError("Failed to generate invoice. Check if data exists for selected month.");
        } finally {
            setGenLoading(false);
        }
    };

    const requestDelete = (id: number) => setDeleteTargetId(id);

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        setDeleteLoading(true);
        try {
            await InvoiceService.delete(deleteTargetId);
            setSuccess("Invoice deleted.");
            if (selectedInvoice?.invoiceID === deleteTargetId) setSelectedInvoice(null);
            fetchAll();
        } catch {
            setError("Failed to delete. This invoice may be linked to other records.");
        } finally {
            setDeleteLoading(false);
            setDeleteTargetId(null);
        }
    };

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head>
            <title>${selectedInvoice?.invoiceNumber ?? "Invoice"}</title>
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
        setTimeout(() => { win.print(); win.close(); }, 600);
    };

    const statusBadge = (s: string) => {
        const cfg: Record<string, { bg: string; color: string }> = {
            Paid: { bg: "#dcfce7", color: "#15803d" },
            Partial: { bg: "#fef3c7", color: "#92400e" },
            Unpaid: { bg: "#fee2e2", color: "#dc2626" },
        };
        const c = cfg[s] ?? { bg: "#f3f4f6", color: "#6b7280" };
        return (
            <span style={{
                background: c.bg, color: c.color,
                padding: "3px 10px", borderRadius: 20,
                fontSize: 12, fontWeight: 700
            }}>
                {s}
            </span>
        );
    };

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />
            <ConfirmModal
                title="Delete Invoice"
                message={deleteTargetId !== null ? "Are you sure you want to delete this invoice? This action cannot be undone." : ""}
                confirmText={deleteLoading ? "Deleting..." : "Delete"}
                onConfirm={confirmDelete}
                onClose={() => setDeleteTargetId(null)}
                isLoading={deleteLoading}
            />

            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "#e8f5e9", display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>
                        <i className="bi bi-receipt-cutoff"
                            style={{ fontSize: "1.3rem", color: "#1B4332" }} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">Invoice Management</h4>
                        <div className="text-muted" style={{ fontSize: "0.84rem" }}>
                            Generate & view employee invoices
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-sm fw-semibold text-white px-3"
                    style={{ background: "#1B4332", borderRadius: 10 }}
                    onClick={() => {
                        setShowForm(!showForm);
                        setSelectedInvoice(null);
                    }}
                >
                    <i className={`bi bi-${showForm ? "x" : "plus-circle"} me-2`} />
                    {showForm ? "Cancel" : "Generate Invoice"}
                </button>
            </div>

            {/* Generate Form */}
            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1B4332" }}>
                        <i className="bi bi-file-earmark-plus me-2" />New Invoice
                    </h6>
                    <div className="row g-3 align-items-end">
                        {/* Employee */}
                        <div className="col-md-4">
                            <label className="form-label fw-semibold small text-muted">
                                EMPLOYEE *
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={form.employeeID}
                                onChange={e => handleEmployeeChange(Number(e.target.value))}
                            >
                                <option value={0}>-- Select Employee --</option>
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

                        <div className="col-md-3">
                            <label className="form-label fw-semibold small text-muted">
                                MONTH & YEAR *
                            </label>
                            <input
                                type="month"
                                className="form-control form-control-sm"
                                value={form.monthYear}
                                max={currentMonthYear}
                                onChange={e => setForm({ ...form, monthYear: e.target.value })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold small text-muted">
                                NOTES (Optional)
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Any notes..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>

                        {/* Generate Button */}
                        <div className="col-md-2">
                            <button
                                className="btn btn-sm w-100 fw-semibold text-white"
                                style={{ background: "#1B4332", borderRadius: 8 }}
                                onClick={handleGenerate}
                                disabled={genLoading}
                            >
                                {genLoading
                                    ? <><span className="spinner-border spinner-border-sm me-1" />
                                        Generating...</>
                                    : <><i className="bi bi-lightning-fill me-1" />Generate</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice List Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header border-0 px-4 py-3"
                    style={{ background: "#1B4332" }}>
                    <h6 className="mb-0 fw-bold text-white">
                        <i className="bi bi-table me-2" />Invoice Records
                    </h6>
                </div>
                {loading ? (
                    <div className="p-4"><Loader /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead style={{ background: "#f0fdf4" }}>
                                <tr>
                                    {[
                                        "Invoice No", "Employee Name", "Emp ID",
                                        "Month / Year", "Generated Date", "Status", "Action"
                                    ].map(h => (
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
                                        <td colSpan={7}
                                            className="text-center text-muted py-5">
                                            <i className="bi bi-inbox"
                                                style={{
                                                    fontSize: "2.5rem",
                                                    display: "block",
                                                    marginBottom: 8,
                                                    opacity: 0.4
                                                }} />
                                            No invoices generated yet.
                                        </td>
                                    </tr>
                                ) : invoices.map(inv => (
                                    <tr
                                        key={inv.invoiceID}
                                        style={{
                                            cursor: "pointer",
                                            background: selectedInvoice?.invoiceID === inv.invoiceID
                                                ? "#f0fdf4" : undefined
                                        }}
                                        onClick={() => setSelectedInvoice(inv)}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <span className="fw-bold"
                                                style={{ color: "#1B4332", fontSize: "0.9rem" }}>
                                                {inv.invoiceNumber}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontWeight: 600,
                                            fontSize: "0.9rem"
                                        }}>
                                            {inv.employeeName}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span className="badge"
                                                style={{
                                                    background: "#e8f5e9",
                                                    color: "#1B4332",
                                                    fontWeight: 700
                                                }}>
                                                #{inv.employeeID}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontSize: "0.9rem",
                                            color: "#374151"
                                        }}>
                                            {inv.monthYear}
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontSize: "0.88rem",
                                            color: "#6b7280"
                                        }}>
                                            {inv.generatedDate}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            {statusBadge(inv.status)}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div className="d-flex gap-2"
                                                onClick={e => e.stopPropagation()}>
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        borderRadius: 8
                                                    }}
                                                    onClick={() => setSelectedInvoice(inv)}
                                                >
                                                    <i className="bi bi-eye me-1" />View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        borderRadius: 8
                                                    }}
                                                    onClick={() => requestDelete(inv.invoiceID)}
                                                >
                                                    <i className="bi bi-trash" />
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
                        style={{
                            backdropFilter: "blur(4px)",
                            backgroundColor: "rgba(0,0,0,0.6)"
                        }}
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
                                            style={{
                                                background: "#e8f5e9",
                                                color: "#1B4332",
                                                borderRadius: 8
                                            }}
                                            onClick={handlePrint}
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
                                <div
                                    className="p-0"
                                    style={{ maxHeight: "80vh", overflowY: "auto" }}
                                    ref={printRef}
                                >
                                    <InvoiceDetailView invoice={selectedInvoice} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ?? Invoice Detail Print View ?? */
const InvoiceDetailView: React.FC<{ invoice: InvoiceDto }> = ({ invoice }) => {
    const grandTotal = invoice.totalAmount + invoice.previousArrears;
    const isDue = invoice.balanceDue > 0;
    const isCredit = invoice.balanceDue < 0;
    const balColor = isDue ? "#dc2626" : isCredit ? "#1e40af" : "#15803d";
    const hasCredit = invoice.previousArrears < 0;

    const th: React.CSSProperties = {
        padding: "11px 18px", color: "white", fontWeight: 700,
        fontSize: 12, textTransform: "uppercase",
        letterSpacing: 0.5, textAlign: "left"
    };
    const td: React.CSSProperties = {
        padding: "13px 18px", fontSize: 13, color: "#374151"
    };

    // Always visible, for every invoice — no conditional hiding.
    const paymentRows: { label: string; value: string; isBalance?: boolean }[] = [
        {
            label: "Milk Consumed (Quantity)",
            value: `${invoice.totalQuantity.toFixed(2)} Litres`,
        },
        {
            label: "Rate Per Litre",
            value: `Rs. ${invoice.ratePerLitre.toFixed(2)}`,
        },
        {
            label: "This Month's Milk Bill",
            value: `Rs. ${invoice.totalAmount.toFixed(2)}`,
        },
        {
            label: hasCredit ? "Credit from Last Month" : "Pending from Last Month",
            value: `Rs. ${Math.abs(invoice.previousArrears).toFixed(2)}${hasCredit ? " (Cr)" : ""}`,
        },
        {
            label: "Total Payable (This Month + Pending/Credit)",
            value: `Rs. ${grandTotal.toFixed(2)}`,
        },
        {
            label: "Amount Paid This Month",
            value: `Rs. ${invoice.amountPaid.toFixed(2)}`,
        },
        {
            label: isDue
                ? "Balance Due (Pending)"
                : isCredit
                    ? "Balance (Credit / Advance)"
                    : "Balance Due (Cleared)",
            value: `Rs. ${Math.abs(invoice.balanceDue).toFixed(2)}${isCredit ? " (Cr)" : ""}`,
            isBalance: true,
        },
    ];

    return (
        <div style={{
            padding: "40px 48px", fontFamily: "Arial, sans-serif",
            maxWidth: 860, margin: "0 auto"
        }}>
            {/* Company Header */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", paddingBottom: 24,
                borderBottom: "3px solid #1B4332", marginBottom: 32
            }}>
                <div>
                    <div style={{
                        display: "flex", alignItems: "center",
                        gap: 12, marginBottom: 8
                    }}>
                        <img
                            src="/logo.jpg"
                            alt="4K Fresh"
                            style={{
                                width: 50, height: 50, borderRadius: 12,
                                objectFit: "cover"
                            }}
                        />
                        <div style={{
                            fontSize: 22, fontWeight: 900, color: "#1B4332"
                        }}>4K FRESH</div>
                    </div>
                    <div style={{
                        fontSize: 12, color: "#6b7280", lineHeight: 1.8
                    }}>
                        Fresh Milk Delivery Services<br />Tamil Nadu, India
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{
                        fontSize: 32, fontWeight: 900,
                        color: "#1B4332", letterSpacing: 2
                    }}>INVOICE</div>
                    <div style={{
                        fontSize: 15, fontWeight: 700,
                        color: "#374151", marginTop: 4
                    }}>
                        {invoice.invoiceNumber}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <span style={{
                            background: invoice.status === "Paid" ? "#dcfce7"
                                : invoice.status === "Partial" ? "#fef3c7" : "#fee2e2",
                            color: invoice.status === "Paid" ? "#15803d"
                                : invoice.status === "Partial" ? "#92400e" : "#dc2626",
                            padding: "5px 16px", borderRadius: 20,
                            fontSize: 12, fontWeight: 800, letterSpacing: 1
                        }}>
                            {invoice.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* TABLE 1: Employee & Invoice Info */}
            <div style={{
                marginBottom: 10, fontSize: 11, fontWeight: 700,
                color: "#1B4332", textTransform: "uppercase", letterSpacing: 1
            }}>
                Employee & Invoice Information
            </div>
            <table style={{
                width: "100%", borderCollapse: "collapse",
                marginBottom: 32, border: "1px solid #e5e7eb"
            }}>
                <thead>
                    <tr style={{ background: "#1B4332" }}>
                        {["Employee Name", "Employee ID", "Invoice Number",
                            "Generated Date", "Month / Year"].map(h => (
                                <th key={h} style={th}>{h}</th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ background: "#f0fdf4" }}>
                        <td style={{
                            ...td, fontWeight: 800,
                            fontSize: 15, color: "#1B4332"
                        }}>
                            {invoice.employeeName}
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>
                            <span style={{
                                background: "#e8f5e9", color: "#1B4332",
                                padding: "3px 12px", borderRadius: 20,
                                fontWeight: 700, fontSize: 13
                            }}>
                                #{invoice.employeeID}
                            </span>
                        </td>
                        <td style={{
                            ...td, textAlign: "center",
                            fontWeight: 700, color: "#1e40af"
                        }}>
                            {invoice.invoiceNumber}
                        </td>
                        <td style={{
                            ...td, textAlign: "center", color: "#6b7280"
                        }}>
                            {invoice.generatedDate}
                        </td>
                        <td style={{
                            ...td, textAlign: "center",
                            fontWeight: 700, color: "#374151"
                        }}>
                            {invoice.monthYear}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* TABLE 2: Full Payment Details */}
            <div style={{
                marginBottom: 10, fontSize: 11, fontWeight: 700,
                color: "#1B4332", textTransform: "uppercase", letterSpacing: 1
            }}>
                Payment Details
            </div>
            <table style={{
                width: "100%", borderCollapse: "collapse",
                marginBottom: 32, border: "1px solid #e5e7eb"
            }}>
                <thead>
                    <tr style={{ background: "#1B4332" }}>
                        <th style={th}>Description</th>
                        <th style={{ ...th, textAlign: "right" }}>
                            Details / Amount
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paymentRows.map((row, i) => (
                        <tr key={i} style={{
                            background: row.isBalance
                                ? (isDue ? "#fff1f2" : isCredit ? "#eff6ff" : "#f0fdf4")
                                : "#ffffff",
                            borderBottom: "1px solid #e5e7eb"
                        }}>
                            <td style={{
                                padding: "13px 18px", fontSize: 13,
                                color: "#374151",
                                fontWeight: row.isBalance ? 700 : 400
                            }}>
                                {row.label}
                            </td>
                            <td style={{
                                padding: "13px 18px", textAlign: "right",
                                fontSize: row.isBalance ? 15 : 13,
                                fontWeight: row.isBalance ? 800 : 600,
                                color: row.isBalance ? balColor : "#374151"
                            }}>
                                {row.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Notes */}
            {invoice.notes && invoice.notes !== "string" && (
                <div style={{
                    background: "#fef3c7", borderRadius: 10,
                    padding: "14px 18px", marginBottom: 28,
                    border: "1px solid #fde68a"
                }}>
                    <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: "#92400e", marginBottom: 4,
                        textTransform: "uppercase"
                    }}>Notes</div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                        {invoice.notes}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                borderTop: "1px solid #e5e7eb", paddingTop: 20,
                display: "flex", justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    Generated by 4K Fresh Milk Management System<br />
                    Computer-generated invoice — no signature required.
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{
                        fontSize: 20, fontWeight: 900,
                        color: balColor, marginTop: 4
                    }}>
                        {isDue
                            ? `Balance: Rs. ${invoice.balanceDue.toFixed(2)}`
                            : isCredit
                                ? `Advance / Credit: Rs. ${Math.abs(invoice.balanceDue).toFixed(2)}`
                                : "FULLY PAID"
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;