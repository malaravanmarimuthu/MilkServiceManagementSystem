/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { LeaveRequestService } from "../Services/LeaveRequestService";
import type { LeaveRequestDto } from "../Services/LeaveRequestService";
import ConfirmModal from "../Components/Common/ConfirmModal";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

const ITEMS_PER_PAGE = 10;

const LEAVE_TYPES = [
    "Casual Leave",
    "Sick Leave",
    "Earned Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Loss of Pay",
];

const getTodayStr = () => new Date().toISOString().split("T")[0];

const emptyForm = {
    employeeID: 0,
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    status: "Pending",
};

const LeaveRequestPage: React.FC = () => {
    const [leaveList, setLeaveList] = useState<LeaveRequestDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveRequestDto | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const data = await LeaveRequestService.getAll();
            const arr = Array.isArray(data)
                ? data
                : (data as any)?.$values ?? (data as any)?.data ?? [];
            setLeaveList([...arr].reverse());
            setCurrentPage(1);
        } catch {
            setError("Failed to load leave requests.");
        } finally {
            setLoading(false);
        }
    };

    const filteredList = leaveList.filter((l) => {
        const combined = `${l.employeeName ?? ""} ${l.leaveType} ${l.status ?? ""}`.toLowerCase();
        return combined.includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const paginated = filteredList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openAddModal = () => {
        setEditingLeave(null);
        setFormData(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (item: LeaveRequestDto) => {
        setEditingLeave(item);
        setFormData({
            employeeID: item.employeeID,
            leaveType: item.leaveType,
            fromDate: item.fromDate?.split("T")[0] ?? "",
            toDate: item.toDate?.split("T")[0] ?? "",
            reason: item.reason,
            // Keep existing status but user cannot change it
            status: item.status ?? "Pending",
        });
        setFormError("");
        setShowModal(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormError("");
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: name === "employeeID" ? Number(value) : value,
            };
            if (name === "fromDate" && updated.toDate && updated.toDate < value) {
                updated.toDate = "";
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        const today = getTodayStr();

        if (!formData.employeeID || formData.employeeID === 0) {
            setFormError("Employee ID is required.");
            return;
        }
        if (!formData.leaveType) {
            setFormError("Please select a leave type.");
            return;
        }
        if (!formData.fromDate) {
            setFormError("From date is required.");
            return;
        }
        if (formData.fromDate < today) {
            setFormError("From date cannot be in the past.");
            return;
        }
        if (!formData.toDate) {
            setFormError("To date is required.");
            return;
        }
        if (formData.toDate < formData.fromDate) {
            setFormError("To date must be on or after From date.");
            return;
        }
        if (!formData.reason.trim()) {
            setFormError("Reason is required.");
            return;
        }

        setSaving(true);
        try {
            if (editingLeave) {
                await LeaveRequestService.update(editingLeave.leaveRequestID, {
                    ...formData,
                    leaveRequestID: editingLeave.leaveRequestID,
                    // Always keep original status - never change on edit
                    status: editingLeave.status ?? "Pending",
                });
                setSuccessMessage("Leave request updated successfully!");
            } else {
                await LeaveRequestService.create({
                    ...formData,
                    leaveRequestID: 0,
                    status: "Pending",
                });
                setSuccessMessage("Leave request created successfully!");
            }
            setShowModal(false);
            fetchAll();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data ??
                "Failed to save leave request.";
            setError(typeof msg === "string" ? msg : "Failed to save leave request.");
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
            await LeaveRequestService.delete(deleteId);
            setSuccessMessage("Leave request deleted successfully!");
            fetchAll();
        } catch {
            setError("Failed to delete leave request.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Pending: "warning",
            Approved: "success",
            Rejected: "danger",
        };
        return (
            <span className={`badge bg-${map[status] ?? "secondary"}`}>
                {status}
            </span>
        );
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Leave Request Management</h2>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        Add Request
                    </button>
                </div>

                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, type, status..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ maxWidth: "300px" }}
                    />
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered text-nowrap">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Leave Type</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item) => (
                                            <tr key={item.leaveRequestID}>
                                                <td>{item.employeeName ?? `Emp #${item.employeeID}`}</td>
                                                <td>{item.leaveType}</td>
                                                <td>{new Date(item.fromDate).toLocaleDateString("en-IN")}</td>
                                                <td>{new Date(item.toDate).toLocaleDateString("en-IN")}</td>
                                                <td
                                                    style={{
                                                        maxWidth: "150px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    title={item.reason}
                                                >
                                                    {item.reason}
                                                </td>
                                                <td>{statusBadge(item.status ?? "Pending")}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-warning me-2"
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => confirmDelete(item.leaveRequestID)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backdropFilter: "blur(4px)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                        }}
                        onClick={() => setShowModal(false)}
                    />
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 px-4 pt-4 pb-0">
                                    <h5 className="modal-title fw-bold">
                                        {editingLeave ? "Edit Leave Request" : "Add Leave Request"}
                                    </h5>
                                </div>
                                <div className="modal-body px-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Employee ID</label>
                                                <input
                                                    type="number"
                                                    name="employeeID"
                                                    className="form-control"
                                                    value={formData.employeeID || ""}
                                                    onChange={handleChange}
                                                    placeholder="Enter employee ID"
                                                    min={1}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Leave Type</label>
                                                <select
                                                    name="leaveType"
                                                    className="form-select"
                                                    value={formData.leaveType}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">-- Select Leave Type --</option>
                                                    {LEAVE_TYPES.map((t) => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">From Date</label>
                                                <input
                                                    type="date"
                                                    name="fromDate"
                                                    className="form-control"
                                                    value={formData.fromDate}
                                                    onChange={handleChange}
                                                    min={getTodayStr()}
                                                    required
                                                />
                                                <small className="text-muted">Past dates cannot be selected</small>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">To Date</label>
                                                <input
                                                    type="date"
                                                    name="toDate"
                                                    className="form-control"
                                                    value={formData.toDate}
                                                    onChange={handleChange}
                                                    min={formData.fromDate || getTodayStr()}
                                                    required
                                                />
                                                <small className="text-muted">Must be on or after From date</small>
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label className="form-label">Reason</label>
                                                <textarea
                                                    name="reason"
                                                    className="form-control"
                                                    value={formData.reason}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    placeholder="Enter reason for leave"
                                                    required
                                                />
                                            </div>

                                            {/* Status - REMOVED from both add and edit */}

                                        </div>

                                        {formError && (
                                            <div className="alert alert-danger py-2 mb-2">
                                                {formError}
                                            </div>
                                        )}

                                        <div className="modal-footer border-0 justify-content-center pb-4 px-0">
                                            <button
                                                type="button"
                                                className="btn btn-secondary rounded-pill px-4"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary rounded-pill px-4"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        {editingLeave ? "Updating..." : "Saving..."}
                                                    </>
                                                ) : editingLeave ? "Update" : "Save"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showConfirm && (
                <ConfirmModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this leave request?"
                    confirmText={deleting ? "Deleting..." : "Delete"}
                    isLoading={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default LeaveRequestPage;