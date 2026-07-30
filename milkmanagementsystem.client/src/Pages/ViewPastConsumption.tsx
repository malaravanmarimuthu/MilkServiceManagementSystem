/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getEmployees } from "../Services/EmployeeService";
import { getLocations } from "../Services/LocationService";
import type { LocationType } from "../Services/LocationService";
import { PaymentService } from "../Services/PaymentService";
import ErrorModal from "../Components/Common/ErrorModal";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";

const getTodayISO = () => new Date().toISOString().split("T")[0];

const ENTRY_TYPES = ["Actual", "Leave", "Other"];

type RowMessage = { type: "success" | "error"; text: string };

const ViewPastConsumption: React.FC = () => {
    const [allEntries, setAllEntries] = useState<MilkEntryDto[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedLocationID, setSelectedLocationID] = useState<number>(0);
    const [empSearchText, setEmpSearchText] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState<string>("");
    const [editPayment, setEditPayment] = useState<string>("");
    const [editType, setEditType] = useState<string>("Actual");
    const [saving, setSaving] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteEmpId, setDeleteEmpId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [rowMessages, setRowMessages] = useState<Record<number, RowMessage>>({});
    const messageTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => { fetchAll(true); }, []);

    const showRowMessage = (empId: number, msg: RowMessage) => {
        setRowMessages(prev => ({ ...prev, [empId]: msg }));
        if (messageTimers.current[empId]) clearTimeout(messageTimers.current[empId]);
        messageTimers.current[empId] = setTimeout(() => {
            setRowMessages(prev => {
                const next = { ...prev };
                delete next[empId];
                return next;
            });
        }, 2500);
    };

    const fetchAll = async (showLoader: boolean) => {
        if (showLoader) setLoading(true);
        try {
            const [entryData, empSubData, empData, payData, locData] = await Promise.all([
                MilkEntryService.getAll(),
                getEmployeeSubscriptions(),
                getEmployees(),
                PaymentService.getAll(),
                getLocations(),
            ]);

            setAllEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setEmpSubscriptions(Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []);
            setEmployees(Array.isArray(empData.data) ? empData.data : empData.data?.$values ?? []);
            setPayments(Array.isArray(payData) ? payData : (payData as any)?.$values ?? []);
            setLocations(Array.isArray(locData) ? locData : (locData as any)?.$values ?? []);
        } catch {
            setError("Failed to load entries.");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const isToday = selectedDate === getTodayISO();

    const activeSubscriptions = empSubscriptions.filter((s: any) =>
        (s.status ?? "").toLowerCase() === "active"
    );

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

    const getEmpName = (empId: number): string => {
        const emp = employees.find((e: any) => Number(e.id ?? e.ID) === empId);
        return emp ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() : `Emp #${empId}`;
    };

    const filteredSubscriptions = relevantSubscriptions.filter((sub: any) => {
        const empId = Number(sub.employeeId ?? sub.EmployeeId ?? sub.employeeID);

        if (selectedLocationID !== 0) {
            const empLocId = getEmployeeLocationID(empId);
            if (empLocId !== selectedLocationID) return false;
        }

        if (empSearchText.trim() !== "") {
            const empName = getEmpName(empId).toLowerCase();
            if (!empName.includes(empSearchText.trim().toLowerCase())) return false;
        }

        return true;
    });

    const tableRows = filteredSubscriptions
        .map((sub: any) => {
            const empId = Number(sub.employeeId ?? sub.EmployeeId ?? sub.employeeID);
            const empName = getEmpName(empId);

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
                    setError("Cannot determine location for this user. Please contact admin.");
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

            cancelEdit();
            await fetchAll(false);
            showRowMessage(row.empId, { type: "success", text: "Updated!" });
        } catch {
            showRowMessage(row.empId, { type: "error", text: "Update failed" });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (milkEntryID: number, empId: number) => {
        setDeleteId(milkEntryID);
        setDeleteEmpId(empId);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (deleteId === null || deleteId < 0) {
            setError("Invalid entry — nothing to delete.");
            setShowConfirm(false);
            setDeleteId(null);
            setDeleteEmpId(null);
            return;
        }
        setDeleting(true);
        const empIdForMessage = deleteEmpId;
        try {
            await MilkEntryService.delete(deleteId);
            await fetchAll(false);
            if (empIdForMessage !== null) {
                showRowMessage(empIdForMessage, { type: "success", text: "Deleted!" });
            }
        } catch {
            if (empIdForMessage !== null) {
                showRowMessage(empIdForMessage, { type: "error", text: "Delete failed" });
            }
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
            setDeleteEmpId(null);
        }
    };

    const getRowStyle = (row: typeof tableRows[0], isEditing: boolean): React.CSSProperties => {
        if (isEditing) return { background: "#fffbe6" };
        if (!row.hasEntry) return { background: "#f8f9fa" };
        if (row.entryType === "Leave") return { background: "#ffe5e5" };
        if (row.entryType === "Actual") return { background: "#f0fff4" };
        return {};
    };

    const totalQty = tableRows.reduce((sum, r) => sum + r.qty, 0);
    const totalPayment = tableRows.reduce((sum, r) => sum + r.paymentAmount, 0);

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
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

                {/* Header row: title only */}
                <div className="mb-3">
                    <h4 className="fw-bold mb-0">Milk Entries</h4>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <select
                            className="form-select"
                            style={{ width: "200px" }}
                            value={selectedLocationID}
                            onChange={(e) => setSelectedLocationID(Number(e.target.value))}
                        >
                            <option value={0}>-- All Locations --</option>
                            {locations.map((loc: any) => {
                                const id = loc.locationID ?? loc.LocationID;
                                const name = loc.locationName ?? loc.LocationName;
                                return <option key={id} value={id}>{name}</option>;
                            })}
                        </select>

                        <div style={{ position: "relative", width: "220px" }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search user..."
                                value={empSearchText}
                                onChange={(e) => setEmpSearchText(e.target.value)}
                            />
                            {empSearchText !== "" && (
                                <button
                                    type="button"
                                    onClick={() => setEmpSearchText("")}
                                    style={{
                                        position: "absolute",
                                        right: "8px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        color: "#94a3b8",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                    title="Clear"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <input
                            type="date"
                            className="form-control"
                            style={{ width: "180px" }}
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                cancelEdit();
                            }}
                        />

                        <button
                            className="btn fw-semibold d-flex align-items-center gap-2"
                            style={{ background: "#1B4332", color: "#fff", borderRadius: "8px" }}
                            onClick={() => fetchAll(true)}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                <span>🔄</span>
                            )}
                            Refresh All
                        </button>
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
                                        <th>User Name</th>
                                        <th style={{ width: "150px" }}>Entry Type</th>
                                        <th style={{ width: "140px" }}>Qty (L)</th>
                                        <th style={{ width: "160px" }}>Payment (₹)</th>
                                        <th style={{ width: "200px" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : tableRows.map((row) => {
                                        const isEditing = editingId === row.empId;
                                        const rowMsg = rowMessages[row.empId];

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
                                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                        ID: {row.empId}
                                                    </div>
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
                                                        <>
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
                                                                        onClick={() => confirmDelete(row.milkEntryID, row.empId)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {rowMsg && (
                                                                <div
                                                                    className="mt-1 fw-semibold"
                                                                    style={{
                                                                        fontSize: "0.75rem",
                                                                        color: rowMsg.type === "success" ? "#198754" : "#dc3545",
                                                                    }}
                                                                >
                                                                    {rowMsg.type === "success" ? "✓ " : "✕ "}{rowMsg.text}
                                                                </div>
                                                            )}
                                                        </>
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