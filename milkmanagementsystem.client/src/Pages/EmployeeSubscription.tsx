/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getEmployeeSubscriptions,
    createEmployeeSubscription,
    updateEmployeeSubscription,
    deleteEmployeeSubscription,
    type EmployeeSubscriptionType,
} from "../Services/EmployeeSubscriptionService";

import { getSubscriptions } from "../Services/SubscriptionService";
import { getEmployees } from "../Services/EmployeeService";

import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import { handleApiSuccess } from "../Helpers/successHandler";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

type FormErrors = {
    employeeId?: string;
    subscriptionId?: string;
    quantity?: string;
    status?: string;
};

function EmployeeSubscription() {
    const [employeeSubscriptions, setEmployeeSubscriptions] = useState<EmployeeSubscriptionType[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const Navigate = useNavigate();

    const [employeeId, setEmployeeId] = useState(0);
    const [subscriptionId, setSubscriptionId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [status, setStatus] = useState("");

    const [oldEmployeeId, setOldEmployeeId] = useState(0);
    const [oldSubscriptionId, setOldSubscriptionId] = useState(0);
    const [oldQuantity, setOldQuantity] = useState(0);
    const [oldStatus, setOldStatus] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EmployeeSubscriptionType | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");

    const recordsPerPage = 10;

    const loadEmployeeSubscriptions = async () => {
        try {
            setLoading(true);

            const data: any = await getEmployeeSubscriptions();

            const arr = Array.isArray(data)
                ? data
                : data?.$values
                    ? data.$values
                    : data?.data?.$values
                        ? data.data.$values
                        : data?.data
                            ? data.data
                            : [];

            setEmployeeSubscriptions(arr);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptions = async () => {
        try {
            const data: any = await getSubscriptions();

            const arr = Array.isArray(data)
                ? data
                : data?.$values
                    ? data.$values
                    : data?.data?.$values
                        ? data.data.$values
                        : data?.data
                            ? data.data
                            : [];

            setSubscriptions(arr);
        } catch {
            setSubscriptions([]);
        }
    };

    const loadEmployees = async () => {
        try {
            const response: any = await getEmployees();
            const data = response.data;

            const arr = Array.isArray(data)
                ? data
                : data?.$values
                    ? data.$values
                    : data?.data?.$values
                        ? data.data.$values
                        : data?.data
                            ? data.data
                            : [];

            setEmployees(arr);
        } catch {
            setEmployees([]);
        }
    };

    useEffect(() => {
        loadEmployeeSubscriptions();
        loadSubscriptions();
        loadEmployees();
    }, []);

    const getSubscriptionName = (id: number) => {
        const sub = subscriptions.find((x) =>
            (x.subscriptionID ??
                x.subscriptionId ??
                x.SubscriptionID ??
                x.SubscriptionId) === id
        );

        if (!sub) return id;

        return sub.milkType ?? sub.MilkType ?? id;
    };

    // Resolve an employeeId to a display name, falling back to the id if not found.
    const getEmployeeName = (id: number) => {
        const emp = employees.find((x) => (x.id ?? x.ID) === id);

        if (!emp) return id;

        const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
        return name || id;
    };

    // Employees who already have a subscription assigned should not show up
    // again in "Select Employee" when adding a new one. When editing, the
    // currently-assigned employee should still appear (so it stays selected).
    const availableEmployees = employees.filter((emp) => {
        const id = emp.id ?? emp.ID;
        const alreadyAssigned = employeeSubscriptions.some(
            (x) => x.employeeId === id && x.employeeSubscriptionId !== editId
        );
        return !alreadyAssigned;
    });

    const filteredEmployeeSubscriptions = employeeSubscriptions
        .filter((item) => {
            const employeeText = String(getEmployeeName(item.employeeId)).toLowerCase();
            const subscriptionText = String(getSubscriptionName(item.subscriptionId)).toLowerCase();
            const quantityText = String(item.quantity).toLowerCase();
            const statusText = item.status.toLowerCase();

            return (
                employeeText.includes(searchTerm.toLowerCase()) ||
                subscriptionText.includes(searchTerm.toLowerCase()) ||
                quantityText.includes(searchTerm.toLowerCase()) ||
                statusText.includes(searchTerm.toLowerCase())
            );
        })
        .sort((a, b) =>
            String(getEmployeeName(a.employeeId)).localeCompare(
                String(getEmployeeName(b.employeeId))
            )
        );

    const totalPages = Math.ceil(
        filteredEmployeeSubscriptions.length / recordsPerPage
    );

    const currentEmployeeSubscriptions = filteredEmployeeSubscriptions.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const clearForm = () => {
        setEmployeeId(0);
        setSubscriptionId(0);
        setQuantity(0);
        setStatus("");

        setOldEmployeeId(0);
        setOldSubscriptionId(0);
        setOldQuantity(0);
        setOldStatus("");

        setEditId(null);
        setFormError("");
        setErrors({});
    };

    const openAddModal = () => {
        clearForm();
        setShowFormModal(true);
    };

    const openEditModal = (item: EmployeeSubscriptionType) => {
        setEditId(item.employeeSubscriptionId);

        setEmployeeId(item.employeeId);
        setSubscriptionId(item.subscriptionId);
        setQuantity(item.quantity);
        setStatus(item.status);

        setOldEmployeeId(item.employeeId);
        setOldSubscriptionId(item.subscriptionId);
        setOldQuantity(item.quantity);
        setOldStatus(item.status);

        setFormError("");
        setErrors({});
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        clearForm();
        setShowFormModal(false);
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (employeeId === 0) {
            newErrors.employeeId = "User is required.";
        }

        if (subscriptionId === 0) {
            newErrors.subscriptionId = "Subscription is required.";
        }

        if (quantity <= 0) {
            newErrors.quantity = "Quantity is required.";
        }

        if (!status.trim()) {
            newErrors.status = "Status is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setFormError("");

        if (!validateForm()) {
            return;
        }

        if (
            editId !== null &&
            employeeId === oldEmployeeId &&
            subscriptionId === oldSubscriptionId &&
            quantity === oldQuantity &&
            status === oldStatus
        ) {
            setFormError("Please update at least one field.");
            return;
        }

        const isDuplicate = employeeSubscriptions.some(
            (x) =>
                x.employeeId === employeeId &&
                x.subscriptionId === subscriptionId &&
                x.employeeSubscriptionId !== editId
        );

        if (isDuplicate) {
            closeFormModal();
            setErrorMessage("This subscription is already assigned to this user.");
            return;
        }

        const data = {
            employeeId,
            subscriptionId,
            quantity,
            status,
        };

        setLoading(true);

        try {
            if (editId === null) {
                await createEmployeeSubscription(data);
                handleApiSuccess("User Subscription Created Successfully", setsuccessMessage);
            } else {
                await updateEmployeeSubscription(editId, data);
                handleApiSuccess("User Subscription Updated Successfully", setsuccessMessage);
            }

            closeFormModal();
            await loadEmployeeSubscriptions();
        } catch (error) {
            closeFormModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (item: EmployeeSubscriptionType) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setLoading(true);

        try {
            await deleteEmployeeSubscription(deleteTarget.employeeSubscriptionId);
            handleApiSuccess("User Subscription Deleted Successfully", setsuccessMessage);
            closeDeleteModal();
            await loadEmployeeSubscriptions();
        } catch (error) {
            closeDeleteModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <ErrorModal
                message={errorMessage}
                onClose={() => setErrorMessage("")}
            />

            <SuccessModal
                message={successMessage}
                onClose={() => setsuccessMessage("")}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>User Subscription Management</h2>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => Navigate("/dashboard")}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={openAddModal}
                    >
                        Add User Subscription
                    </button>
                </div>
            </div>

            <div className="mb-3" style={{ maxWidth: "400px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search user subscription..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <Loader text="Loading User Subscriptions..." />
            ) : (
                <>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Subscription</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentEmployeeSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center">
                                        No user subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                currentEmployeeSubscriptions.map((item, index) => (
                                    <tr key={item.employeeSubscriptionId || index}>
                                        <td>{getEmployeeName(item.employeeId)}</td>
                                        <td>{getSubscriptionName(item.subscriptionId)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => openEditModal(item)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => openDeleteModal(item)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {showFormModal && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editId === null
                                        ? "Add User Subscription"
                                        : "Edit User Subscription"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeFormModal}
                                />
                            </div>

                            <div className="modal-body">
                                <div className="mb-2">
                                    <span className="text-danger fw-bold">*</span>{" "}
                                    <span className="text-muted small">
                                        indicates mandatory fields
                                    </span>
                                </div>

                                {formError && (
                                    <div className="alert alert-danger mb-3">
                                        {formError}
                                    </div>
                                )}

                                {/* User Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        User <span className="text-danger">*</span>
                                    </label>

                                    <select
                                        className={`form-select ${errors.employeeId ? "is-invalid" : ""}`}
                                        value={employeeId}
                                        onChange={(e) => {
                                            setEmployeeId(Number(e.target.value));
                                            setErrors(prev => ({ ...prev, employeeId: undefined }));
                                            setFormError("");
                                        }}
                                    >
                                        <option value={0}>-- Select User --</option>
                                        {availableEmployees.map((emp) => {
                                            const id = emp.id ?? emp.ID;
                                            const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();

                                            return (
                                                <option key={id} value={id}>
                                                    {name} (ID: {id})
                                                </option>
                                            );
                                        })}
                                    </select>

                                    {errors.employeeId && (
                                        <span className="text-danger small">
                                            {errors.employeeId}
                                        </span>
                                    )}
                                </div>

                                {/* Subscription Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Subscription <span className="text-danger">*</span>
                                    </label>

                                    <select
                                        className={`form-select ${errors.subscriptionId ? "is-invalid" : ""}`}
                                        value={subscriptionId}
                                        onChange={(e) => {
                                            setSubscriptionId(Number(e.target.value));
                                            setErrors(prev => ({ ...prev, subscriptionId: undefined }));
                                            setFormError("");
                                        }}
                                    >
                                        <option value={0}>-- Select Subscription --</option>
                                        {subscriptions.map((sub, index) => {
                                            const id =
                                                sub.subscriptionID ??
                                                sub.subscriptionId ??
                                                sub.SubscriptionID ??
                                                sub.SubscriptionId ??
                                                index;

                                            const name =
                                                sub.milkType ??
                                                sub.MilkType ??
                                                id;

                                            return (
                                                <option key={id} value={id}>
                                                    {name}
                                                </option>
                                            );
                                        })}
                                    </select>

                                    {errors.subscriptionId && (
                                        <span className="text-danger small">
                                            {errors.subscriptionId}
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Quantity <span className="text-danger">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                                        value={quantity === 0 ? "" : quantity}
                                        onChange={(e) => {
                                            setQuantity(Number(e.target.value));
                                            setErrors(prev => ({ ...prev, quantity: undefined }));
                                            setFormError("");
                                        }}
                                        placeholder="Enter Quantity"
                                    />

                                    {errors.quantity && (
                                        <span className="text-danger small">
                                            {errors.quantity}
                                        </span>
                                    )}
                                </div>

                                {/* Status Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Status <span className="text-danger">*</span>
                                    </label>

                                    <select
                                        className={`form-select ${errors.status ? "is-invalid" : ""}`}
                                        value={status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                            setErrors(prev => ({ ...prev, status: undefined }));
                                            setFormError("");
                                        }}
                                    >
                                        <option value="">-- Select Status --</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Freeze">Freeze</option>
                                    </select>

                                    {errors.status && (
                                        <span className="text-danger small">
                                            {errors.status}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={closeFormModal}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : editId === null
                                            ? "Save"
                                            : "Update"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Delete User Subscription
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeDeleteModal}
                                />
                            </div>

                            <div className="modal-body">
                                Are you sure you want to delete this user subscription?
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={closeDeleteModal}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={loading}
                                >
                                    {loading ? "Deleting..." : "Delete"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeSubscription;