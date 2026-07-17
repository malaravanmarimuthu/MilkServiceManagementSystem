/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { LeaveRequestService } from "../Services/LeaveRequestService";
import type { LeaveRequestDto } from "../Services/LeaveRequestService";
import { getEmployees } from "../Services/EmployeeService";
import ConfirmModal from "../Components/Common/ConfirmModal";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";
import { jwtDecode } from "jwt-decode";

const ITEMS_PER_PAGE = 10;

const LEAVE_TYPES = [
    "Casual Leave",
    "Vacation/Freeze Leave",
    "Cancel",
    "Emergency Leave",
];

const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
};

const getTodayStr = () => new Date().toISOString().split("T")[0];

const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
};

const NO_TO_DATE_TYPES = ["Vacation/Freeze Leave", "Cancel", "Emergency Leave"];

const INFINITY_DATE = "9999-12-31";

interface JwtPayload {
    userid: string;
    firstname: string;
    mobile: string;
    rolename?: string;
    role?: string;
    RoleName?: string;
}

const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return { employeeID: 0, firstName: "", role: "" };
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const role = decoded.rolename ?? decoded.role ?? decoded.RoleName ?? "";
        return {
            employeeID: Number(decoded.userid),
            firstName: decoded.firstname,
            role: role.toLowerCase(),
        };
    } catch {
        return { employeeID: 0, firstName: "", role: "" };
    }
};

const LeaveRequestPage: React.FC = () => {
    const loggedInUser = getLoggedInUser();
    const isAdmin = loggedInUser.role === "admin" || loggedInUser.role === "supervisor";

    const getEmptyForm = () => ({
        employeeID: isAdmin ? 0 : loggedInUser.employeeID,
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        status: "Pending",
    });

    const [leaveList, setLeaveList] = useState<LeaveRequestDto[]>([]);
    const [employeeList, setEmployeeList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveRequestDto | null>(null);
    const [formData, setFormData] = useState(getEmptyForm());
    const [formError, setFormError] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    // Resume modal state
    const [resumeItem, setResumeItem] = useState<LeaveRequestDto | null>(null);
    const [resuming, setResuming] = useState(false);

    useEffect(() => {
        fetchAll();
        if (isAdmin) fetchEmployees();
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

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            const data: any = res.data;
            const arr = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];
            setEmployeeList(arr);
        } catch {
            console.error("Failed to load users");
        }
    };

    const filteredList = leaveList.filter((l) => {
        if (!isAdmin && l.employeeID !== loggedInUser.employeeID) return false;
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
        setFormData(getEmptyForm());
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
            status: item.status ?? "Pending",
        });
        setFormError("");
        setShowModal(true);
    };

    const handleLeaveTypeChange = (leaveType: string) => {
        setFormError("");
        if (leaveType === "Emergency Leave" && !isAdmin) {
            setFormData((prev) => ({
                ...prev,
                leaveType,
                fromDate: getTodayStr(),
                toDate: "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                leaveType,
                fromDate: "",
                toDate: "",
            }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormError("");
        const { name, value } = e.target;

        if (name === "leaveType") {
            handleLeaveTypeChange(value);
            return;
        }

        if (name === "fromDate" && formData.leaveType === "Emergency Leave" && !isAdmin) {
            return;
        }

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

    const getMinFromDate = () => {
        if (isAdmin) return undefined;
        if (formData.leaveType === "Emergency Leave") return getTodayStr();
        return getTomorrowStr();
    };

    const getMaxFromDate = () => {
        if (isAdmin) return undefined;
        if (formData.leaveType === "Emergency Leave") return getTodayStr();
        return undefined;
    };

    const isNoToDate = NO_TO_DATE_TYPES.includes(formData.leaveType);
    const isEmergency = formData.leaveType === "Emergency Leave";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        if (isAdmin && (!formData.employeeID || formData.employeeID === 0)) {
            setFormError("Please select an user.");
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

        // Date restrictions apply only to non-admin users.
        if (!isAdmin) {
            if (isEmergency && formData.fromDate !== getTodayStr()) {
                setFormError("Emergency Leave must be today's date.");
                return;
            }
            if (!isEmergency && formData.fromDate < getTomorrowStr()) {
                setFormError("From date must be tomorrow or later.");
                return;
            }
        }

        if (!isNoToDate) {
            if (!formData.toDate) {
                setFormError("To date is required.");
                return;
            }
            if (formData.toDate < formData.fromDate) {
                setFormError("To date must be on or after From date.");
                return;
            }
        }
        if (!formData.reason.trim()) {
            setFormError("Reason is required.");
            return;
        }

        setSaving(true);
        try {
            // Ongoing leave types (Cancel / Vacation / Emergency) are stored
            // with toDate = INFINITY_DATE so the table shows "Ongoing"
            // until an admin resumes it.
            const payload = {
                ...formData,
                toDate: isNoToDate ? INFINITY_DATE : formData.toDate,
            };

            if (editingLeave) {
                await LeaveRequestService.update(editingLeave.leaveRequestID, {
                    ...payload,
                    leaveRequestID: editingLeave.leaveRequestID,
                    status: editingLeave.status ?? "Pending",
                });
                setSuccessMessage("Leave request updated successfully!");
            } else {
                await LeaveRequestService.create({
                    ...payload,
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

    const handleStatusUpdate = async (item: LeaveRequestDto, newStatus: string) => {
        setUpdatingId(item.leaveRequestID);
        try {
            await LeaveRequestService.update(item.leaveRequestID, {
                ...item,
                status: newStatus,
            });
            setSuccessMessage(`Leave request ${newStatus} successfully!`);
            fetchAll();
        } catch {
            setError("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleResume = async (mode: "today" | "tomorrow") => {
        if (!resumeItem) return;
        setResuming(true);
        try {
            const fromDate = resumeItem.fromDate?.split("T")[0] ?? resumeItem.fromDate;
            let newToDate = mode === "today" ? getYesterdayStr() : getTodayStr();

            if (newToDate < fromDate) {
                newToDate = fromDate;
            }

            await LeaveRequestService.update(resumeItem.leaveRequestID, {
                ...resumeItem,
                toDate: newToDate,
            });
            setSuccessMessage(
                mode === "today"
                    ? "User resumed from today!"
                    : "User will resume from tomorrow!"
            );
            fetchAll();
        } catch {
            setError("Failed to resume User.");
        } finally {
            setResuming(false);
            setResumeItem(null);
        }
    };

    const isOngoing = (item: LeaveRequestDto) =>
        (item.toDate?.split("T")[0] ?? "") === INFINITY_DATE;

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
            <SuccessModal message={successMessage} onClose={() => setSuccessMessage("")} />
            <ConfirmModal
                message={showConfirm ? "Are you sure you want to delete this leave request?" : ""}
                onConfirm={handleDelete}
                onClose={() => { setShowConfirm(false); setDeleteId(null); }}
                isLoading={deleting}
            />

            {resumeItem && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backdropFilter: "blur(4px)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                        }}
                        onClick={() => !resuming && setResumeItem(null)}
                    />
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0 px-4 pt-4 pb-0">
                                    <h5 className="modal-title fw-bold">Resume User</h5>
                                </div>
                                <div className="modal-body px-4 py-3">
                                    <p className="mb-3">
                                        From when should <strong>{resumeItem.employeeName ?? `Emp #${resumeItem.employeeID}`}</strong> resume?
                                    </p>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-primary flex-fill"
                                            disabled={resuming}
                                            onClick={() => handleResume("today")}
                                        >
                                            {resuming ? (
                                                <span className="spinner-border spinner-border-sm me-2" />
                                            ) : null}
                                            Resume from Today
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary flex-fill"
                                            disabled={resuming}
                                            onClick={() => handleResume("tomorrow")}
                                        >
                                            {resuming ? (
                                                <span className="spinner-border spinner-border-sm me-2" />
                                            ) : null}
                                            Resume from Tomorrow
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={resuming}
                                        onClick={() => setResumeItem(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Leave Request Management</h2>
                    <div className="d-flex gap-2">
                        <button className="btn btn-danger" onClick={() => window.history.back()}>
                            Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Request
                        </button>
                    </div>
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
                                        <th>User</th>
                                        <th>Leave Type</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        {isAdmin && <th>Approval</th>}
                                        {isAdmin && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin ? 8 : 6} className="text-center">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item) => (
                                            <tr key={item.leaveRequestID}>
                                                <td>{item.employeeName ?? `Emp #${item.employeeID}`}</td>
                                                <td>{item.leaveType}</td>
                                                <td>{new Date(item.fromDate).toLocaleDateString("en-IN")}</td>
                                                <td>
                                                    {isOngoing(item)
                                                        ? <span className="text-muted">Ongoing</span>
                                                        : new Date(item.toDate).toLocaleDateString("en-IN")
                                                    }
                                                </td>
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

                                                {isAdmin && (
                                                    <td>
                                                        {item.status === "Pending" ? (
                                                            <div className="d-flex gap-1">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    disabled={updatingId === item.leaveRequestID}
                                                                    onClick={() => handleStatusUpdate(item, "Approved")}
                                                                >
                                                                    {updatingId === item.leaveRequestID ? (
                                                                        <span className="spinner-border spinner-border-sm" />
                                                                    ) : "Approve"}
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    disabled={updatingId === item.leaveRequestID}
                                                                    onClick={() => handleStatusUpdate(item, "Rejected")}
                                                                >
                                                                    {updatingId === item.leaveRequestID ? (
                                                                        <span className="spinner-border spinner-border-sm" />
                                                                    ) : "Reject"}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                disabled={updatingId === item.leaveRequestID}
                                                                onClick={() => handleStatusUpdate(item, "Pending")}
                                                            >
                                                                {updatingId === item.leaveRequestID ? (
                                                                    <span className="spinner-border spinner-border-sm" />
                                                                ) : "Cancel"}
                                                            </button>
                                                        )}
                                                    </td>
                                                )}

                                                {isAdmin && (
                                                    <td>
                                                        <div className="d-flex gap-1 flex-wrap">
                                                            <button
                                                                className="btn btn-sm btn-warning"
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
                                                            {isOngoing(item) && (
                                                                <button
                                                                    className="btn btn-sm btn-info"
                                                                    onClick={() => setResumeItem(item)}
                                                                >
                                                                    Resume
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
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

                                            {isAdmin ? (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Select User</label>
                                                    <select
                                                        name="employeeID"
                                                        className="form-select"
                                                        value={formData.employeeID}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value={0} disabled>-- Select user --</option>
                                                        {employeeList.map((emp: any) => {
                                                            const id = emp.employeeID ?? emp.id ?? emp.ID ?? emp.Id;
                                                            const firstName = emp.firstName ?? emp.FirstName ?? emp.first_name ?? "";
                                                            const lastName = emp.lastName ?? emp.LastName ?? emp.last_name ?? "";
                                                            return (
                                                                <option key={id} value={id}>
                                                                    {`${firstName} ${lastName}`.trim()} (ID: {id})
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">User</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={loggedInUser.firstName}
                                                        disabled
                                                    />
                                                </div>
                                            )}

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
                                                    {LEAVE_TYPES.map((lt) => (
                                                        <option key={lt} value={lt}>{lt}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {formData.leaveType && (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">
                                                        From Date
                                                        {isEmergency && !isAdmin && (
                                                            <span className="badge bg-danger ms-2">Today Only</span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="fromDate"
                                                        className="form-control"
                                                        value={formData.fromDate}
                                                        min={getMinFromDate()}
                                                        max={getMaxFromDate()}
                                                        onChange={handleChange}
                                                        readOnly={isEmergency && !isAdmin}
                                                        style={isEmergency && !isAdmin ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
                                                        required
                                                    />
                                                    {isEmergency && !isAdmin && (
                                                        <small className="text-muted">
                                                            Emergency leave is automatically set to today and cannot be changed.
                                                        </small>
                                                    )}
                                                    {!isEmergency && !isAdmin && (
                                                        <small className="text-muted">
                                                            Select from tomorrow onwards.
                                                        </small>
                                                    )}
                                                </div>
                                            )}

                                            {formData.leaveType && !isNoToDate && (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">To Date</label>
                                                    <input
                                                        type="date"
                                                        name="toDate"
                                                        className="form-control"
                                                        value={formData.toDate}
                                                        min={isAdmin ? undefined : (formData.fromDate || getTomorrowStr())}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {formData.leaveType && isNoToDate && formData.fromDate && (
                                                <div className="col-md-6 mb-3 d-flex align-items-end">
                                                    <div className="alert alert-info py-2 px-3 mb-0 w-100">
                                                        {isEmergency
                                                            ? "🚨 Emergency Leave starts today and continues until cancelled."
                                                            : formData.leaveType === "Cancel"
                                                                ? "❌ Cancel starts from selected date and continues until reactivated."
                                                                : `📅 ${formData.leaveType} starts from selected date and continues automatically.`
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {formData.leaveType && (
                                                <div className="col-12 mb-3">
                                                    <label className="form-label">Reason</label>
                                                    <textarea
                                                        name="reason"
                                                        className="form-control"
                                                        rows={3}
                                                        placeholder="Enter reason for leave"
                                                        value={formData.reason}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {formError && (
                                                <div className="col-12">
                                                    <div className="alert alert-danger py-2">{formError}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 pt-2 pb-3">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                ) : null}
                                                {saving ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default LeaveRequestPage;