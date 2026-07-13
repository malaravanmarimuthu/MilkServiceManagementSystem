/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { ProcurementEntryService } from "../Services/ProcurementEntryService";
import type { ProcurementEntryDto } from "../Services/ProcurementEntryService";
import { getEmployees } from "../Services/EmployeeService";
import ErrorModal from "../Components/Common/ErrorModal";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";

const MILK_TYPES = ["Cow", "Buffalo"];
const getTodayISO = () => new Date().toISOString().split("T")[0];

type RowMessage = { type: "success" | "error"; text: string };

const ProcurementEntry: React.FC = () => {
    const [entries, setEntries] = useState<ProcurementEntryDto[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
    const [empSearchText, setEmpSearchText] = useState("");

    const [newEmployeeId, setNewEmployeeId] = useState<number>(0);
    const [newMilkType, setNewMilkType] = useState("Cow");
    const [newQty, setNewQty] = useState("");
    const [newRate, setNewRate] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState("");
    const [editRate, setEditRate] = useState("");
    const [editMilkType, setEditMilkType] = useState("Cow");
    const [saving, setSaving] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [rowMessages, setRowMessages] = useState<Record<number, RowMessage>>({});
    const messageTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => { fetchAll(true); }, []);

    const showRowMessage = (id: number, msg: RowMessage) => {
        setRowMessages(prev => ({ ...prev, [id]: msg }));
        if (messageTimers.current[id]) clearTimeout(messageTimers.current[id]);
        messageTimers.current[id] = setTimeout(() => {
            setRowMessages(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }, 2500);
    };

    const fetchAll = async (showLoader: boolean) => {
        if (showLoader) setLoading(true);
        try {
            const [entryData, empData] = await Promise.all([
                ProcurementEntryService.getAll(),
                getEmployees(),
            ]);
            setEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setEmployees(Array.isArray(empData.data) ? empData.data : empData.data?.$values ?? []);
        } catch {
            setError("Failed to load procurement entries.");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const handleManualRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAll(false);
        } finally {
            setRefreshing(false);
        }
    };

    const farmers = employees.filter((emp: any) => {
        const role = (emp.roleName ?? emp.RoleName ?? emp.role ?? emp.Role ?? "").toLowerCase();
        return role === "farmer";
    });

    const getEmpName = (empId: number): string => {
        const emp = employees.find((e: any) => Number(e.id ?? e.ID) === empId);
        return emp ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() : `Emp #${empId}`;
    };

    // Date-wise filter + search filter combined
    const dateFilteredEntries = entries.filter((e) => {
        const entryDateOnly = (e.entryDate ?? "").split("T")[0];
        return entryDateOnly === selectedDate;
    });

    const filteredEntries = dateFilteredEntries.filter((e) => {
        if (!empSearchText.trim()) return true;
        const name = (e.supplierName ?? getEmpName(e.employeeId)).toLowerCase();
        return name.includes(empSearchText.trim().toLowerCase());
    });

    const totalQty = filteredEntries.reduce((sum, e) => sum + Number(e.quantity ?? 0), 0);
    const totalAmount = filteredEntries.reduce((sum, e) => sum + Number(e.totalAmount ?? 0), 0);

    const resetAddForm = () => {
        setNewEmployeeId(0);
        setNewMilkType("Cow");
        setNewQty("");
        setNewRate("");
        setAddError("");
    };

    const handleAdd = async () => {
        setAddError("");
        if (!newEmployeeId) {
            setAddError("Please select a farmer.");
            return;
        }
        if (!newQty || Number(newQty) <= 0) {
            setAddError("Quantity must be greater than zero.");
            return;
        }

        setAdding(true);
        try {
            await ProcurementEntryService.create({
                employeeId: newEmployeeId,
                milkType: newMilkType,
                quantity: Number(newQty),
                rate: newRate ? Number(newRate) : 0,
                entryDate: selectedDate,
            });
            resetAddForm();
            await fetchAll(false);
        } catch (err: any) {
            setAddError(err?.response?.data?.message ?? "Failed to add entry.");
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (entry: ProcurementEntryDto) => {
        setEditingId(entry.id ?? null);
        setEditQty(String(entry.quantity));
        setEditRate(String(entry.rate));
        setEditMilkType(entry.milkType);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditQty("");
        setEditRate("");
        setEditMilkType("Cow");
    };

    const handleUpdate = async (entry: ProcurementEntryDto) => {
        setSaving(true);
        try {
            await ProcurementEntryService.update({
                id: entry.id,
                employeeId: entry.employeeId,
                milkType: editMilkType,
                quantity: Number(editQty),
                rate: Number(editRate),
                entryDate: entry.entryDate,
            });
            cancelEdit();
            await fetchAll(false);
            showRowMessage(entry.id!, { type: "success", text: "Updated!" });
        } catch {
            showRowMessage(entry.id!, { type: "error", text: "Update failed" });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        setDeleting(true);
        try {
            await ProcurementEntryService.delete(deleteId);
            await fetchAll(false);
        } catch {
            setError("Delete failed.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            {showConfirm && (
                <ConfirmModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this procurement entry?"
                    confirmText={deleting ? "Deleting..." : "Delete"}
                    isLoading={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}

            <div className="container-fluid mt-3 px-4">

                {/* Top row: Title + Date + Refresh All */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h4 className="fw-bold mb-0">Milk Procurement</h4>

                    <div className="d-flex gap-2 align-items-center">
                        <input
                            type="date"
                            className="form-control"
                            style={{ width: "180px" }}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        <button
                            className="btn fw-semibold d-flex align-items-center gap-2"
                            style={{ background: "#1B4332", color: "#fff", borderRadius: "8px" }}
                            onClick={handleManualRefresh}
                            disabled={refreshing || loading}
                        >
                            {refreshing ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                <span>🔄</span>
                            )}
                            Refresh All
                        </button>
                    </div>
                </div>

                {/* Add new entry form */}
                <div className="card mb-4 p-3" style={{ borderRadius: "10px" }}>
                    <div className="d-flex flex-wrap gap-2 align-items-end">
                        <div>
                            <label className="form-label fw-semibold" style={{ fontSize: "0.8rem" }}>Farmer</label>
                            <select
                                className="form-select"
                                style={{ width: "220px" }}
                                value={newEmployeeId}
                                onChange={(e) => setNewEmployeeId(Number(e.target.value))}
                            >
                                <option value={0}>-- Select Farmer --</option>
                                {farmers.map((emp: any) => {
                                    const id = emp.id ?? emp.ID;
                                    const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
                                    return <option key={id} value={id}>{name}</option>;
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="form-label fw-semibold" style={{ fontSize: "0.8rem" }}>Milk Type</label>
                            <select
                                className="form-select"
                                style={{ width: "140px" }}
                                value={newMilkType}
                                onChange={(e) => setNewMilkType(e.target.value)}
                            >
                                {MILK_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label fw-semibold" style={{ fontSize: "0.8rem" }}>Quantity (L)</label>
                            <input
                                type="number"
                                className="form-control"
                                style={{ width: "120px" }}
                                min={0}
                                step="0.01"
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="form-label fw-semibold" style={{ fontSize: "0.8rem" }}>
                                Rate (₹/L) <span className="text-muted">(optional)</span>
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                style={{ width: "120px" }}
                                min={0}
                                step="0.01"
                                placeholder="Auto"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn fw-semibold"
                            style={{ background: "#1B4332", color: "#fff", borderRadius: "8px", padding: "9px 22px" }}
                            disabled={adding}
                            onClick={handleAdd}
                        >
                            {adding ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Add Entry
                        </button>
                    </div>
                    {addError && (
                        <div className="text-danger fw-semibold mt-2" style={{ fontSize: "0.85rem" }}>
                            {addError}
                        </div>
                    )}
                </div>

                {/* Search row */}
                <div className="mb-3" style={{ position: "relative", width: "260px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search farmer..."
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

                {loading ? (
                    <Loader text="Loading procurement entries..." />
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Farmer Name</th>
                                        <th style={{ width: "130px" }}>Milk Type</th>
                                        <th style={{ width: "130px" }}>Quantity (L)</th>
                                        <th style={{ width: "130px" }}>Rate (₹/L)</th>
                                        <th style={{ width: "150px" }}>Total (₹)</th>
                                        <th style={{ width: "200px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted py-4">
                                                No procurement entries found for this date.
                                            </td>
                                        </tr>
                                    ) : filteredEntries.map((entry) => {
                                        const isEditing = editingId === entry.id;
                                        const rowMsg = entry.id ? rowMessages[entry.id] : undefined;
                                        const bg = entry.milkType === "Cow" ? "#f0fff4" : "#eef6ff";

                                        return (
                                            <tr key={entry.id} style={{ background: isEditing ? "#fffbe6" : bg }}>
                                                <td>
                                                    <div className="fw-semibold">
                                                        {entry.supplierName ?? getEmpName(entry.employeeId)}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                        ID: {entry.employeeId}
                                                    </div>
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editMilkType}
                                                            onChange={(e) => setEditMilkType(e.target.value)}
                                                        >
                                                            {MILK_TYPES.map((t) => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`badge ${entry.milkType === "Cow" ? "bg-success" : "bg-primary"}`}>
                                                            {entry.milkType}
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ width: "90px" }}
                                                            step="0.01"
                                                            min={0}
                                                            value={editQty}
                                                            onChange={(e) => setEditQty(e.target.value)}
                                                        />
                                                    ) : (
                                                        <span className="fw-bold">{entry.quantity} L</span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ width: "90px" }}
                                                            step="0.01"
                                                            min={0}
                                                            value={editRate}
                                                            onChange={(e) => setEditRate(e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>₹{Number(entry.rate).toFixed(2)}</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <span className="fw-bold text-success">
                                                        ₹{Number(entry.totalAmount ?? 0).toFixed(2)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                disabled={saving}
                                                                onClick={() => handleUpdate(entry)}
                                                            >
                                                                {saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                disabled={saving}
                                                                onClick={cancelEdit}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-warning"
                                                                    onClick={() => startEdit(entry)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => confirmDelete(entry.id!)}
                                                                >
                                                                    Delete
                                                                </button>
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
                                        <td></td>
                                        <td>₹{totalAmount.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ProcurementEntry;