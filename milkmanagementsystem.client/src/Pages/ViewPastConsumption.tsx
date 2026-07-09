/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getEmployees } from "../Services/EmployeeService";
import { PaymentService } from "../Services/PaymentService";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";

const getTodayISO = () => new Date().toISOString().split("T")[0];

const ENTRY_TYPES = ["Actual", "Leave", "Other"];

const ViewPastConsumption: React.FC = () => {
    const [allEntries, setAllEntries] = useState<MilkEntryDto[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState<string>("");
    const [editPayment, setEditPayment] = useState<string>("");
    const [editType, setEditType] = useState<string>("Actual");
    const [saving, setSaving] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [entryData, empSubData, empData, payData] = await Promise.all([
                MilkEntryService.getAll(),
                getEmployeeSubscriptions(),
                getEmployees(),
                PaymentService.getAll(),
            ]);

            setAllEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setEmpSubscriptions(Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []);
            setEmployees(Array.isArray(empData.data) ? empData.data : empData.data?.$values ?? []);
            setPayments(Array.isArray(payData) ? payData : (payData as any)?.$values ?? []);
        } catch {
            setError("Failed to load entries.");
        } finally {
            setLoading(false);
        }
    };

    const isToday = selectedDate === getTodayISO();

    const activeSubscriptions = empSubscriptions.filter((s: any) =>
        (s.status ?? "").toLowerCase() === "active"
    );

    // Today -> only active subscriptions. Past dates -> all subscriptions (historical data preserved).
    const relevantSubscriptions = isToday ? activeSubscriptions : empSubscriptions;

    const getSubscriptionQty = (empId: number): number => {
        const sub = activeSubscriptions.find((s: any) =>
            Number(s.employeeId ?? s.EmployeeId ?? s.employeeID) === empId
        );
        return Number(sub?.quantity ?? sub?.Quantity ?? 0);
    };

    const getPaymentForDate = (empId: number): number => {
        const p = payments.find((p: any) => {
            const pEmpId = Number(p.employeeID ?? p.EmployeeID ?? p.employeeId);
            const pDate = (p.paidDate ?? p.PaidDate ?? "").split("T")[0];
            return pEmpId === empId && pDate === selectedDate;
        });
        return p ? Number(p.totalAmount ?? p.TotalAmount ?? 0) : 0;
    };

    const getPaymentId = (empId: number): number | null => {
        const p = payments.find((p: any) => {
            const pEmpId = Number(p.employeeID ?? p.EmployeeID ?? p.employeeId);
            const pDate = (p.paidDate ?? p.PaidDate ?? "").split("T")[0];
            return pEmpId === empId && pDate === selectedDate;
        });
        return p ? (p.paymentID ?? p.PaymentID ?? null) : null;
    };

    const getEmployeeLocationID = (empId: number): number | null => {
        const emp = employees.find((e: any) => Number(e.id ?? e.ID) === empId);
        const fromEmployee = emp?.locationID ?? emp?.LocationID;
        if (fromEmployee) return Number(fromEmployee);

        const existingLocationEntry = allEntries.find(
            (e: any) => Number(e.employeeID) === empId
        );
        const fromEntry = existingLocationEntry?.locationID ?? (existingLocationEntry as any)?.LocationID;
        return fromEntry ? Number(fromEntry) : null;
    };

    const tableRows = relevantSubscriptions
        .map((sub: any) => {
            const empId = Number(sub.employeeId ?? sub.EmployeeId ?? sub.employeeID);
            const emp = employees.find((e: any) => Number(e.id ?? e.ID) === empId);
            const empName = emp
                ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
                : `Emp #${empId}`;

            const entry = allEntries.find((e) =>
                Number(e.employeeID) === empId &&
                e.entryDate?.split("T")[0] === selectedDate
            ) ?? null;

            const paymentAmount = getPaymentForDate(empId);

            return {
                empId,
                empName,
                entry,
                qty: Number(entry?.quantity ?? 0),
                entryType: entry?.entryType ?? "—",
                paymentAmount,
                milkEntryID: entry?.milkEntryID ?? -empId,
                hasEntry: !!entry,
            };
        })
        .sort((a, b) => {
            const aIsLeave = a.entryType === "Leave" ? 0 : 1;
            const bIsLeave = b.entryType === "Leave" ? 0 : 1;
            if (aIsLeave !== bIsLeave) return aIsLeave - bIsLeave;
            return a.empName.localeCompare(b.empName);
        });

    const startEdit = (row: typeof tableRows[0]) => {
        setEditingId(row.empId);
        const initialType = row.hasEntry ? row.entryType : "Actual";
        setEditType(initialType);
        if (initialType === "Actual") {
            setEditQty(String(getSubscriptionQty(row.empId)));
        } else {
            setEditQty(String(row.qty));
        }
        setEditPayment(String(row.paymentAmount));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditQty("");
        setEditPayment("");
        setEditType("Actual");
    };

    const handleUpdate = async (row: typeof tableRows[0]) => {
        setSaving(true);
        try {
            const newQty = editType === "Leave" ? 0 : editType === "Actual" ? getSubscriptionQty(row.empId) : Number(editQty);
            let savedMilkEntryID = row.entry?.milkEntryID ?? 0;

            if (row.hasEntry && row.entry) {
                await MilkEntryService.update(row.entry.milkEntryID, {
                    ...row.entry,
                    quantity: newQty,
                    entryType: editType,
                });
            } else {
                const resolvedLocationID = getEmployeeLocationID(row.empId);

                if (!resolvedLocationID) {
                    setError("Cannot determine location for this employee. Please contact admin.");
                    setSaving(false);
                    return;
                }

                const created: any = await MilkEntryService.create({
                    employeeID: row.empId,
                    entryDate: selectedDate,
                    entryType: editType,
                    quantity: newQty,
                    locationID: resolvedLocationID,
                } as any);

                savedMilkEntryID =
                    created?.milkEntryID ??
                    created?.data?.milkEntryID ??
                    created?.MilkEntryID ??
                    created?.data?.MilkEntryID ??
                    0;
            }

            const newPayment = Number(editPayment);
            const paymentId = getPaymentId(row.empId);

            if (newPayment > 0) {
                if (paymentId === null) {
                    await PaymentService.create({
                        employeeID: row.empId,
                        milkEntryID: savedMilkEntryID,
                        quantity: newQty,
                        ratePerLiter: 0,
                        totalAmount: newPayment,
                        paidDate: selectedDate,
                    });
                } else if (newPayment !== row.paymentAmount) {
                    await PaymentService.update(paymentId, {
                        paymentID: paymentId,
                        employeeID: row.empId,
                        milkEntryID: savedMilkEntryID,
                        quantity: newQty,
                        ratePerLiter: 0,
                        totalAmount: newPayment,
                        paidDate: selectedDate,
                    });
                }
            } else if (paymentId !== null) {
                await PaymentService.delete(paymentId);
            }

            setSuccess("Updated successfully!");
            cancelEdit();
            await fetchAll();
        } catch {
            setError("Failed to update.");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (milkEntryID: number) => {
        setDeleteId(milkEntryID);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (deleteId === null || deleteId < 0) {
            setError("Invalid entry — nothing to delete.");
            setShowConfirm(false);
            setDeleteId(null);
            return;
        }
        setDeleting(true);
        try {
            await MilkEntryService.delete(deleteId);
            setSuccess("Entry deleted successfully!");
            await fetchAll();
        } catch {
            setError("Failed to delete entry.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const getRowStyle = (row: typeof tableRows[0], isEditing: boolean): React.CSSProperties => {
        if (isEditing) return { background: "#fffbe6" };
        if (!row.hasEntry) return { background: "#f8f9fa" };
        if (row.entryType === "Leave") return { background: "#ffe5e5" };
        if (row.entryType === "Actual") return { background: "#f0fff4" };
        return {};
    };

    const formatDisplayDate = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${d}-${m}-${y}`;
    };

    const totalQty = tableRows.reduce((sum, r) => sum + r.qty, 0);
    const totalPayment = tableRows.reduce((sum, r) => sum + r.paymentAmount, 0);

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />
            {showConfirm && (
                <ConfirmModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this entry?"
                    confirmText={deleting ? "Deleting..." : "Delete"}
                    isLoading={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}

            <div className="container-fluid mt-3 px-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Milk Entries</h4>
                    <div className="d-flex align-items-center gap-2">
                        <label className="fw-semibold mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                            Date:
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            style={{ width: "180px" }}
                            value={selectedDate}
                            max={getTodayISO()}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                cancelEdit();
                            }}
                        />
                        <span
                            className="px-3 py-2 rounded-3 fw-semibold"
                            style={{ background: "#1B4332", color: "#fff", fontSize: "0.9rem", whiteSpace: "nowrap" }}
                        >
                            {formatDisplayDate(selectedDate)}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <Loader text="Loading entries..." />
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Employee Name</th>
                                        <th style={{ width: "150px" }}>Entry Type</th>
                                        <th style={{ width: "140px" }}>Qty (L)</th>
                                        <th style={{ width: "160px" }}>Payment (₹)</th>
                                        <th style={{ width: "180px" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">
                                                No active subscriptions found.
                                            </td>
                                        </tr>
                                    ) : tableRows.map((row) => {
                                        const isEditing = editingId === row.empId;

                                        return (
                                            <tr
                                                key={row.empId}
                                                style={{
                                                    ...getRowStyle(row, isEditing),
                                                    transition: "background 0.2s"
                                                }}
                                            >
                                                <td>
                                                    <div className="fw-semibold">{row.empName}</div>
                                                    {!isEditing && row.entryType === "Leave" && (
                                                        <span className="badge mt-1" style={{ background: "#dc3545", fontSize: "0.68rem" }}>
                                                            On Leave
                                                        </span>
                                                    )}
                                                    {!isEditing && row.entryType === "Other" && (
                                                        <span className="badge mt-1 bg-primary" style={{ fontSize: "0.68rem" }}>
                                                            Other
                                                        </span>
                                                    )}
                                                    {!isEditing && !row.hasEntry && (
                                                        <span className="badge mt-1 bg-secondary" style={{ fontSize: "0.68rem" }}>
                                                            No Entry
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ minWidth: "110px" }}
                                                            value={editType}
                                                            onChange={(ev) => {
                                                                const newType = ev.target.value;
                                                                setEditType(newType);
                                                                if (newType === "Leave") {
                                                                    setEditQty("0");
                                                                    setEditPayment("0");
                                                                }
                                                                else if (newType === "Actual") {
                                                                    setEditQty(String(getSubscriptionQty(row.empId)));
                                                                }
                                                            }}
                                                        >
                                                            {ENTRY_TYPES.map((t) => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    ) : row.hasEntry ? (
                                                        <span className={`badge ${row.entryType === "Actual" ? "bg-success" :
                                                            row.entryType === "Leave" ? "bg-danger" :
                                                                "bg-primary"
                                                            }`}>
                                                            {row.entryType}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "80px" }}
                                                                step="0.01"
                                                                value={editType === "Leave" ? "0" :
                                                                    editType === "Actual" ? String(getSubscriptionQty(row.empId)) : editQty}
                                                                min={0}
                                                                disabled={editType === "Leave" || editType === "Actual"}
                                                                onChange={(ev) => setEditQty(ev.target.value)}
                                                            />
                                                            <span className="text-muted">L</span>
                                                        </div>
                                                    ) : (
                                                        <span className={`fw-bold ${!row.hasEntry ? "text-muted" : ""}`}>
                                                            {row.qty} L
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <span className="text-muted">₹</span>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "100px" }}
                                                                step="0.01"
                                                                value={editType === "Leave" ? "0" : editPayment}
                                                                min={0}
                                                                disabled={editType === "Leave"}
                                                                onChange={(ev) => setEditPayment(ev.target.value)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className={`fw-bold ${row.paymentAmount > 0 ? "text-success" : "text-muted"}`}>
                                                            ₹{row.paymentAmount.toFixed(2)}
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleUpdate(row)}
                                                                disabled={saving}
                                                            >
                                                                {saving
                                                                    ? <span className="spinner-border spinner-border-sm" />
                                                                    : "Save"
                                                                }
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={cancelEdit}
                                                                disabled={saving}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() => startEdit(row)}
                                                            >
                                                                Edit
                                                            </button>
                                                            {row.hasEntry && (
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => confirmDelete(row.milkEntryID)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot>
                                    <tr className="table-secondary fw-bold">
                                        <td colSpan={2} className="text-end">Total:</td>
                                        <td>{totalQty.toFixed(2)} L</td>
                                        <td>₹{totalPayment.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="d-flex gap-3 mt-2">
                            <div className="d-flex align-items-center gap-1">
                                <div style={{ width: 14, height: 14, background: "#f0fff4", border: "1px solid #b7ebc8", borderRadius: 3 }} />
                                <small className="text-muted">Actual</small>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div style={{ width: 14, height: 14, background: "#ffe5e5", border: "1px solid #f5c2c7", borderRadius: 3 }} />
                                <small className="text-muted">Leave</small>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div style={{ width: 14, height: 14, background: "#f8f9fa", border: "1px solid #ccc", borderRadius: 3 }} />
                                <small className="text-muted">No Entry</small>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ViewPastConsumption;