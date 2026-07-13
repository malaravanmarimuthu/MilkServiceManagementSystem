/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceService, type InvoiceDto, type CreateInvoiceRequest, } from "../Services/InvoiceService";
import { getEmployees } from "../Services/EmployeeService";
import { LeaveRequestService } from "../Services/LeaveRequestService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";

const Invoice: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [bulkLoading, setBulkLoading] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [bulkMonthYear, setBulkMonthYear] = useState("");
    const [bulkNotes, setBulkNotes] = useState("");
    const [bulkResult, setBulkResult] = useState<{ success: number; failed: number; skipped: number } | null>(null);

    const [filterMonthYear, setFilterMonthYear] = useState("");
    const [searchName, setSearchName] = useState("");

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadTarget, setDownloadTarget] = useState<InvoiceDto | null>(null);
    const hiddenDownloadRef = useRef<HTMLDivElement>(null);

    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const [form, setForm] = useState<CreateInvoiceRequest>({
        employeeID: 0,
        monthYear: currentMonthYear,
        previousArrears: 0,
        notes: "",
    });

    useEffect(() => {
        fetchAll();
        setBulkMonthYear(currentMonthYear);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [invData, empData, leaveData] = await Promise.all([
                InvoiceService.getAll(),
                getEmployees(),
                LeaveRequestService.getAll(),
            ]);
            const invArr = Array.isArray(invData)
                ? invData
                : (invData as any)?.$values ?? [];
            setInvoices(invArr);

            const empArr = Array.isArray((empData as any).data)
                ? (empData as any).data
                : (empData as any).data?.$values ?? [];
            setEmployees(empArr);

            const leaveArr = Array.isArray(leaveData)
                ? leaveData
                : (leaveData as any)?.$values ?? (leaveData as any)?.data ?? [];
            setLeaveRequests(leaveArr);
        } catch {
            setError("Failed to load data.");
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
        if (!form.employeeID) return setError("Please select an user.");
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

    const handleGenerateAll = async () => {
        if (!bulkMonthYear) return setError("Please select month & year for bulk generation.");

        setBulkLoading(true);
        setBulkResult(null);
        try {
            const res = await InvoiceService.generateAll(bulkMonthYear);
            setBulkResult({ success: res.successCount, failed: res.failedCount, skipped: res.skippedCount });
            setSuccess(`Bulk generation done: ${res.successCount} created, ${res.skippedCount} skipped, ${res.failedCount} failed.`);
        } catch {
            setError("Bulk generation failed.");
        } finally {
            setBulkLoading(false);
            setShowBulkForm(false);
            setBulkNotes("");
            fetchAll();
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
            setSelectedIds(prev => prev.filter(id => id !== deleteTargetId));
            fetchAll();
        } catch {
            setError("Failed to delete. This invoice may be linked to other records.");
        } finally {
            setDeleteLoading(false);
            setDeleteTargetId(null);
        }
    };

    // ---- Filters ----
    const filteredInvoices = invoices.filter((inv) => {
        const matchesMonth = !filterMonthYear || toMonthKey(inv.monthYear) === filterMonthYear;
        const matchesName = !searchName.trim() ||
            (inv.employeeName ?? "").toLowerCase().includes(searchName.trim().toLowerCase());
        return matchesMonth && matchesName;
    });

    // ---- Selection / bulk delete ----
    const allVisibleSelected = filteredInvoices.length > 0 &&
        filteredInvoices.every(inv => selectedIds.includes(inv.invoiceID));

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            setSelectedIds(prev => prev.filter(id => !filteredInvoices.some(inv => inv.invoiceID === id)));
        } else {
            const visibleIds = filteredInvoices.map(inv => inv.invoiceID);
            setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setBulkDeleteLoading(true);
        try {
            const results = await Promise.allSettled(
                selectedIds.map(id => InvoiceService.delete(id))
            );
            const failedCount = results.filter(r => r.status === "rejected").length;
            const successCount = results.length - failedCount;

            if (failedCount > 0) {
                setError(`${successCount} invoices deleted, ${failedCount} failed.`);
            } else {
                setSuccess(`${successCount} invoice(s) deleted successfully!`);
            }

            if (selectedInvoice && selectedIds.includes(selectedInvoice.invoiceID)) {
                setSelectedInvoice(null);
            }
            setSelectedIds([]);
            fetchAll();
        } catch {
            setError("Bulk delete failed.");
        } finally {
            setBulkDeleteLoading(false);
            setShowBulkDeleteConfirm(false);
        }
    };

    // ---- Print (opens print dialog — kept for convenience) ----
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

    // ---- Generic PDF generator: works off ANY rendered node (modal or hidden) ----
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

    const advanceBadge = (balanceDue: number) => {
        if (balanceDue >= 0) return null;
        return (
            <span style={{
                background: "#ede9fe", color: "#6d28d9",
                padding: "3px 10px", borderRadius: 20,
                fontSize: 11, fontWeight: 700, marginLeft: 6,
                whiteSpace: "nowrap"
            }}>
                Advance Rs. {Math.abs(balanceDue).toFixed(2)}
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
            <ConfirmModal
                title="Delete Selected Invoices"
                message={showBulkDeleteConfirm
                    ? `Are you sure you want to permanently delete ${selectedIds.length} selected invoice(s)? This action cannot be undone.`
                    : ""}
                confirmText={bulkDeleteLoading ? "Deleting..." : "Delete All Selected"}
                onConfirm={handleBulkDelete}
                onClose={() => setShowBulkDeleteConfirm(false)}
                isLoading={bulkDeleteLoading}
            />

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

            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
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
                            Generate & view User invoices
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm fw-semibold text-white px-3"
                        style={{ background: "#845ec2", borderRadius: 10 }}
                        onClick={() => {
                            setShowBulkForm(!showBulkForm);
                            setShowForm(false);
                            setSelectedInvoice(null);
                        }}
                    >
                        <i className={`bi bi-${showBulkForm ? "x" : "people-fill"} me-2`} />
                        {showBulkForm ? "Cancel" : "Generate for All"}
                    </button>
                    <button
                        className="btn btn-sm fw-semibold text-white px-3"
                        style={{ background: "#1B4332", borderRadius: 10 }}
                        onClick={() => {
                            setShowForm(!showForm);
                            setShowBulkForm(false);
                            setSelectedInvoice(null);
                        }}
                    >
                        <i className={`bi bi-${showForm ? "x" : "plus-circle"} me-2`} />
                        {showForm ? "Cancel" : "Generate Invoice"}
                    </button>
                </div>
            </div>

            {showBulkForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: "4px solid #845ec2" }}>
                    <h6 className="fw-bold mb-3" style={{ color: "#845ec2" }}>
                        <i className="bi bi-people-fill me-2" />Generate Invoices for All Users
                    </h6>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold small text-muted">
                                MONTH & YEAR *
                            </label>
                            <input
                                type="month"
                                className="form-control form-control-sm"
                                value={bulkMonthYear}
                                max={currentMonthYear}
                                onChange={e => setBulkMonthYear(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold small text-muted">
                                NOTES (Optional — applied to all)
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Any notes..."
                                value={bulkNotes}
                                onChange={e => setBulkNotes(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <button
                                className="btn btn-sm w-100 fw-semibold text-white"
                                style={{ background: "#845ec2", borderRadius: 8 }}
                                onClick={handleGenerateAll}
                                disabled={bulkLoading || employees.length === 0}
                            >
                                {bulkLoading
                                    ? <><span className="spinner-border spinner-border-sm me-1" />Generating...</>
                                    : <><i className="bi bi-lightning-fill me-1" />Generate for {employees.length} Users</>
                                }
                            </button>
                        </div>
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: "0.78rem" }}>
                        Users who already have an invoice for the selected month will be skipped automatically.
                    </div>
                    {bulkResult && (
                        <div className="mt-3 p-3 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <span className="fw-semibold" style={{ color: "#15803d" }}>
                                ✓ {bulkResult.success} created
                            </span>
                            {" · "}
                            <span className="fw-semibold" style={{ color: "#92400e" }}>
                                {bulkResult.skipped} skipped
                            </span>
                            {" · "}
                            <span className="fw-semibold" style={{ color: "#dc2626" }}>
                                {bulkResult.failed} failed
                            </span>
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1B4332" }}>
                        <i className="bi bi-file-earmark-plus me-2" />New Invoice
                    </h6>
                    <div className="row g-3 align-items-end">

                        <div className="col-md-4">
                            <label className="form-label fw-semibold small text-muted">
                                USER *
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={form.employeeID}
                                onChange={e => handleEmployeeChange(Number(e.target.value))}
                            >
                                <option value={0}>-- Select User --</option>
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

            <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold small text-muted">
                            FILTER BY MONTH
                        </label>
                        <input
                            type="month"
                            className="form-control form-control-sm"
                            value={filterMonthYear}
                            onChange={e => setFilterMonthYear(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold small text-muted">
                            SEARCH USER NAME
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type user name..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                        />
                    </div>
                    {(filterMonthYear || searchName) && (
                        <div className="col-md-2">
                            <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => { setFilterMonthYear(""); setSearchName(""); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                    <div className="col-md-3 ms-auto text-md-end">
                        <button
                            className="btn btn-sm fw-semibold text-white px-3"
                            style={{ background: selectedIds.length > 0 ? "#dc2626" : "#9ca3af", borderRadius: 8 }}
                            disabled={selectedIds.length === 0}
                            onClick={() => setShowBulkDeleteConfirm(true)}
                        >
                            <i className="bi bi-trash me-1" />
                            Delete Selected ({selectedIds.length})
                        </button>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header border-0 px-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{ background: "#1B4332" }}>
                    <h6 className="mb-0 fw-bold text-white">
                        <i className="bi bi-table me-2" />Invoice Records
                    </h6>
                    {filteredInvoices.length > 0 && (
                        <div className="form-check d-flex align-items-center gap-2 mb-0">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="selectAllTop"
                                style={{ width: 18, height: 18, cursor: "pointer" }}
                                checked={allVisibleSelected}
                                onChange={toggleSelectAll}
                            />
                            <label htmlFor="selectAllTop" className="form-check-label text-white small fw-semibold" style={{ cursor: "pointer" }}>
                                {allVisibleSelected ? "Unselect All" : "Select All"}
                            </label>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="p-4"><Loader /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead style={{ background: "#f0fdf4" }}>
                                <tr>
                                    <th style={{ padding: "12px 16px", width: 40, textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            style={{ width: 16, height: 16, cursor: "pointer" }}
                                            checked={allVisibleSelected}
                                            onChange={toggleSelectAll}
                                            title="Select all"
                                        />
                                    </th>
                                    {[
                                        "Invoice No", "User Name",
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
                                {filteredInvoices.length === 0 ? (
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
                                            No invoices found.
                                        </td>
                                    </tr>
                                ) : filteredInvoices.map(inv => (
                                    <tr
                                        key={inv.invoiceID}
                                        style={{
                                            cursor: "pointer",
                                            background: selectedInvoice?.invoiceID === inv.invoiceID
                                                ? "#f0fdf4" : undefined
                                        }}
                                    >
                                        <td style={{ padding: "12px 16px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                style={{ width: 16, height: 16, cursor: "pointer" }}
                                                checked={selectedIds.includes(inv.invoiceID)}
                                                onChange={() => toggleSelectOne(inv.invoiceID)}
                                            />
                                        </td>
                                        <td style={{ padding: "12px 16px" }} onClick={() => setSelectedInvoice(inv)}>
                                            <span className="fw-bold"
                                                style={{ color: "#1B4332", fontSize: "0.9rem" }}>
                                                {inv.invoiceNumber}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontWeight: 600,
                                            fontSize: "0.9rem"
                                        }} onClick={() => setSelectedInvoice(inv)}>
                                            {inv.employeeName}
                                            <span style={{
                                                marginLeft: 6,
                                                color: "#6b7280",
                                                fontWeight: 500,
                                                fontSize: "0.82rem"
                                            }}>
                                                (ID: {inv.employeeID})
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontSize: "0.9rem",
                                            color: "#374151"
                                        }} onClick={() => setSelectedInvoice(inv)}>
                                            {inv.monthYear}
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            fontSize: "0.88rem",
                                            color: "#6b7280"
                                        }} onClick={() => setSelectedInvoice(inv)}>
                                            {inv.generatedDate}
                                        </td>
                                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }} onClick={() => setSelectedInvoice(inv)}>
                                            {statusBadge(inv.status)}
                                            {advanceBadge(inv.balanceDue)}
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
                                                    className="btn btn-sm btn-outline-primary"
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        borderRadius: 8
                                                    }}
                                                    disabled={downloadingId === inv.invoiceID}
                                                    onClick={() => handleRowDownload(inv)}
                                                >
                                                    {downloadingId === inv.invoiceID
                                                        ? <span className="spinner-border spinner-border-sm" />
                                                        : <><i className="bi bi-download me-1" />Download</>
                                                    }
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
                                            className="btn btn-sm fw-semibold"
                                            style={{
                                                background: "#e8f5e9",
                                                color: "#1B4332",
                                                borderRadius: 8
                                            }}
                                            onClick={handlePrint}
                                        >
                                            <i className="bi bi-printer me-1" />Print
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

export const InvoiceDetailView: React.FC<{ invoice: InvoiceDto; noOfLeaves?: number }> = ({ invoice, noOfLeaves = 0 }) => {
    const grandTotal = invoice.totalAmount + invoice.previousArrears;

    const isDue = invoice.balanceDue > 0;
    const isAdvance = invoice.balanceDue < 0;
    const advanceAmount = isAdvance ? Math.abs(invoice.balanceDue) : 0;

    const balColor = isDue ? "#dc2626" : isAdvance ? "#6d28d9" : "#15803d";

    const th: React.CSSProperties = {
        padding: "11px 18px", color: "white", fontWeight: 700,
        fontSize: 12, textTransform: "uppercase",
        letterSpacing: 0.5, textAlign: "left"
    };
    const td: React.CSSProperties = {
        padding: "13px 18px", fontSize: 13, color: "#374151"
    };

    // Clear, plain-language wording for every line so anyone reading the
    // invoice understands exactly what each number means.
    const paymentRows: { label: string; value: string; isBalance?: boolean }[] = [
        {
            label: "Milk Consumed This Month",
            value: `${invoice.totalQuantity.toFixed(2)} Litres`,
        },
        {
            label: "This Month's Bill Amount",
            value: `Rs. ${invoice.totalAmount.toFixed(2)}`,
        },
        {
            label: "Pending Amount (Balance From Before)",
            value: `Rs. ${invoice.previousArrears.toFixed(2)}`,
        },
        {
            label: "Total Amount To Pay (This Month's Bill + Pending Amount)",
            value: `Rs. ${grandTotal.toFixed(2)}`,
        },
        {
            label: "Amount Already Paid This Month",
            value: `Rs. ${invoice.amountPaid.toFixed(2)}`,
        },
        {
            label: "No. of Leave Days This Month",
            value: `${noOfLeaves} ${noOfLeaves === 1 ? "day" : "days"}`,
        },
        {
            label: isDue
                ? "Amount Still To Be Paid (Balance Due)"
                : isAdvance
                    ? "Extra Amount Paid In Advance"
                    : "Balance — Fully Settled, Nothing Pending",
            value: isDue
                ? `Rs. ${invoice.balanceDue.toFixed(2)}`
                : isAdvance
                    ? `Rs. ${advanceAmount.toFixed(2)}`
                    : `Rs. 0.00`,
            isBalance: true,
        },
    ];

    return (
        <div style={{
            padding: "40px 48px", fontFamily: "Arial, sans-serif",
            maxWidth: 860, margin: "0 auto"
        }}>

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
                            padding: "4px 14px", borderRadius: 20,
                            fontSize: 13, fontWeight: 800, letterSpacing: 1
                        }}>
                            {invoice.status === "Partial" ? "PARTIAL PAID" : invoice.status.toUpperCase()}
                        </span>
                        {isAdvance && (
                            <span style={{
                                background: "#ede9fe", color: "#6d28d9",
                                padding: "4px 14px", borderRadius: 20,
                                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                                marginLeft: 8, display: "inline-block", marginTop: 6
                            }}>
                                ADVANCE PAID
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{
                marginBottom: 10, fontSize: 11, fontWeight: 700,
                color: "#1B4332", textTransform: "uppercase", letterSpacing: 1
            }}>
                User & Invoice Information
            </div>
            <table style={{
                width: "100%", borderCollapse: "collapse",
                marginBottom: 32, border: "1px solid #e5e7eb"
            }}>
                <thead>
                    <tr style={{ background: "#1B4332" }}>
                        {["User Name", "User ID", "Invoice Number",
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
                                ? (isDue ? "#fff1f2" : isAdvance ? "#f5f3ff" : "#f0fdf4")
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
                            ? `You Still Need To Pay: Rs. ${invoice.balanceDue.toFixed(2)}`
                            : isAdvance
                                ? `Extra Paid In Advance: Rs. ${advanceAmount.toFixed(2)}`
                                : "FULLY PAID — NOTHING PENDING"
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;