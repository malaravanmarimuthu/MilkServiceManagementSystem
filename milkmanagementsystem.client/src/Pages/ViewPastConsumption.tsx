/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";

const getTodayISO = () => new Date().toISOString().split("T")[0];

const ViewPastConsumption: React.FC = () => {
    const [allEntries, setAllEntries] = useState<MilkEntryDto[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState("");
    const [saving, setSaving] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const data = await MilkEntryService.getAll();
            const arr = Array.isArray(data) ? data : (data as any)?.$values ?? [];
            setAllEntries(arr);
        } catch {
            setError("Failed to load entries.");
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = allEntries
        .filter((e) => e.entryDate?.split("T")[0] === selectedDate)
        .sort((a, b) => {

            // Leave employees first
            if (a.entryType === "Leave" && b.entryType !== "Leave") return -1;
            if (a.entryType !== "Leave" && b.entryType === "Leave") return 1;

            // Sort by employee name (A-Z)
            const nameA = (a.employeeName ?? "").toLowerCase();
            const nameB = (b.employeeName ?? "").toLowerCase();

            return nameA.localeCompare(nameB);
        });

    const startEdit = (entry: MilkEntryDto) => {
        setEditingId(entry.milkEntryID);
        setEditQty(String(entry.quantity));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditQty("");
    };

    const handleUpdate = async (entry: MilkEntryDto) => {
        setSaving(true);
        try {
            await MilkEntryService.update(entry.milkEntryID, {
                ...entry,
                quantity: Number(editQty),
            });
            setSuccess("Entry updated successfully!");
            cancelEdit();
            fetchEntries();
        } catch {
            setError("Failed to update entry.");
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
            await MilkEntryService.delete(deleteId);
            setSuccess("Entry deleted successfully!");
            fetchEntries();
        } catch {
            setError("Failed to delete entry.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const getRowStyle = (entry: MilkEntryDto, isEditing: boolean): React.CSSProperties => {
        if (isEditing) return { background: "#fffbe6" };
        if (entry.entryType === "Leave") return { background: "#ffe5e5" };
        if (entry.entryType === "Actual") return { background: "#f0fff4" };
        return {};
    };

    const formatDisplayDate = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${d}-${m}-${y}`;
    };

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
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <div style={{ fontSize: "2rem" }}>??</div>
                        No entries found for {formatDisplayDate(selectedDate)}.
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: "100px" }}>Emp ID</th>
                                        <th>Employee Name</th>
                                        <th>Location</th>
                                        <th style={{ width: "150px" }}>Qty (L)</th>
                                        <th style={{ width: "160px" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEntries.map((e) => {
                                        const isEditing = editingId === e.milkEntryID;

                                        return (
                                            <tr
                                                key={e.milkEntryID}
                                                style={{
                                                    ...getRowStyle(e, isEditing),
                                                    transition: "background 0.2s"
                                                }}
                                            >
                                                <td
                                                    className="text-muted fw-semibold"
                                                    style={{ fontSize: "0.85rem" }}
                                                >
                                                    {e.employeeID}
                                                </td>

                                                <td>
                                                    <div className="fw-semibold">
                                                        {e.employeeName ?? `Emp #${e.employeeID}`}
                                                    </div>

                                                    {e.entryType === "Leave" && (
                                                        <span
                                                            className="badge mt-1"
                                                            style={{
                                                                background: "#dc3545",
                                                                fontSize: "0.68rem"
                                                            }}
                                                        >
                                                            On Leave
                                                        </span>
                                                    )}

                                                    {e.entryType === "Other" && (
                                                        <span
                                                            className="badge mt-1 bg-primary"
                                                            style={{ fontSize: "0.68rem" }}
                                                        >
                                                            Other
                                                        </span>
                                                    )}
                                                </td>

                                                <td>{e.locationName}</td>

                                                {/* Qty Column */}
                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "80px" }}
                                                                value={editQty}
                                                                min={0}
                                                                autoFocus
                                                                onChange={(ev) => setEditQty(ev.target.value)}
                                                            />
                                                            <span className="text-muted">L</span>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold">{e.quantity} L</span>
                                                    )}
                                                </td>

                                                {/* Actions Column */}
                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleUpdate(e)}
                                                                disabled={saving}
                                                            >
                                                                {saving ? (
                                                                    <span className="spinner-border spinner-border-sm" />
                                                                ) : (
                                                                    "Save"
                                                                )}
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
                                                                onClick={() => startEdit(e)}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => confirmDelete(e.milkEntryID)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot>
                                    <tr className="table-secondary fw-bold">
                                        <td colSpan={3} className="text-end">
                                            Total Qty:
                                        </td>
                                        <td>
                                            {filteredEntries
                                                .reduce((sum, e) => sum + (e.quantity ?? 0), 0)
                                                .toFixed(1)}{" "}
                                            L
                                        </td>
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
                                <div style={{ width: 14, height: 14, background: "#fff", border: "1px solid #ccc", borderRadius: 3 }} />
                                <small className="text-muted">Other</small>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ViewPastConsumption;