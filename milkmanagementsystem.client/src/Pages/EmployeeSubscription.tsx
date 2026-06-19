/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getEmployeeSubscriptions,
    createEmployeeSubscription,
    updateEmployeeSubscription,
    deleteEmployeeSubscription,
    type EmployeeSubscriptionType,
} from "../Services/EmployeeSubscriptionService";

import { getEmployees } from "../Services/EmployeeService";
import { getSubscriptions } from "../Services/SubscriptionService";

import { handleApiError } from "../Helpers/errorHandler";
import { handleApiSuccess } from "../Helpers/successHandler";

import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

type FormErrors = {
    employeeId?: string;
    subscriptionId?: string;
    status?: string;
};

function EmployeeSubscription() {
    const [employeeSubscriptions, setEmployeeSubscriptions] = useState<EmployeeSubscriptionType[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const Navigate = useNavigate();

    const [employeeId, setEmployeeId] = useState(0);
    const [subscriptionId, setSubscriptionId] = useState(0);
    const [status, setStatus] = useState("");

    const [oldEmployeeId, setOldEmployeeId] = useState(0);
    const [oldSubscriptionId, setOldSubscriptionId] = useState(0);
    const [oldStatus, setOldStatus] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EmployeeSubscriptionType | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const recordsPerPage = 10;

    const loadEmployeeSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await getEmployeeSubscriptions();
            setEmployeeSubscriptions(Array.isArray(data) ? [...data].reverse() : []);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        try {
            const res = await getEmployees();
            const data: any = res.data;
            const arr = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];
            setEmployees(arr);
        } catch {
            setEmployees([]);
        }
    };

    const loadSubscriptions = async () => {
        try {
            const data = await getSubscriptions();
            const arr = Array.isArray(data)
                ? data
                : (data as any)?.$values ?? (data as any)?.data ?? [];
            setSubscriptions(arr);
        } catch {
            setSubscriptions([]);
        }
    };

    useEffect(() => {
        loadEmployeeSubscriptions();
        loadEmployees();
        loadSubscriptions();
    }, []);

    const getEmployeeName = (id: number) => {
        const emp = employees.find((x) =>
            (x.id ?? x.ID ?? x.employeeId ?? x.EmployeeId) === id
        );

        if (!emp) return id;

        return `${emp.firstName ?? emp.FirstName ?? ""} ${emp.lastName ?? emp.LastName ?? ""}`.trim();
    };

    const getSubscriptionName = (id: number) => {
        const sub = subscriptions.find((x) =>
            (x.subscriptionID ?? x.subscriptionId ?? x.SubscriptionID ?? x.SubscriptionId) === id
        );

        if (!sub) return id;

        return sub.milkType ?? sub.MilkType ?? id;
    };

    const filteredEmployeeSubscriptions = employeeSubscriptions.filter((item) => {
        const employeeName = String(getEmployeeName(item.employeeId)).toLowerCase();
        const subscriptionName = String(getSubscriptionName(item.subscriptionId)).toLowerCase();
        const statusText = item.status.toLowerCase();

        return (
            employeeName.includes(searchTerm.toLowerCase()) ||
            subscriptionName.includes(searchTerm.toLowerCase()) ||
            statusText.includes(searchTerm.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredEmployeeSubscriptions.length / recordsPerPage);

    const currentEmployeeSubscriptions = filteredEmployeeSubscriptions.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const clearForm = () => {
        setEmployeeId(0);
        setSubscriptionId(0);
        setStatus("");

        setOldEmployeeId(0);
        setOldSubscriptionId(0);
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
        setStatus(item.status);

        setOldEmployeeId(item.employeeId);
        setOldSubscriptionId(item.subscriptionId);
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
            newErrors.employeeId = "Employee is required.";
        }

        if (subscriptionId === 0) {
            newErrors.subscriptionId = "Subscription is required.";
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
            setErrorMessage("This subscription is already assigned to this employee.");
            return;
        }

        const data = {
            employeeId,
            subscriptionId,
            status,
        };

        setLoading(true);

        try {
            if (editId === null) {
                await createEmployeeSubscription(data);
                handleApiSuccess("Employee Subscription Created Successfully", setsuccessMessage);
            } else {
                await updateEmployeeSubscription(editId, data);
                handleApiSuccess("Employee Subscription Updated Successfully", setsuccessMessage);
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
            handleApiSuccess("Employee Subscription Deleted Successfully", setsuccessMessage);
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
                <h2>Employee Subscription Management</h2>

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
                        Add Employee Subscription
                    </button>
                </div>
            </div>

            <div className="mb-3" style={{ maxWidth: "400px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search employee subscription..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <Loader text="Loading Employee Subscriptions..." />
            ) : (
                <>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Subscription</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {employeeSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        No employee subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                currentEmployeeSubscriptions.map((item, index) => (
                                    <tr key={item.employeeSubscriptionId || index}>
                                        <td>{getEmployeeName(item.employeeId)}</td>
                                        <td>{getSubscriptionName(item.subscriptionId)}</td>
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
                                        ? "Add Employee Subscription"
                                        : "Edit Employee Subscription"}
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

                                <div className="mb-3">
                                    <label className="form-label">
                                        Employee <span className="text-danger">*</span>
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
                                        <option value={0}>-- Select Employee --</option>
                                        {employees.map((emp, index) => {
                                            const id =
                                                emp.id ??
                                                emp.ID ??
                                                emp.employeeId ??
                                                emp.EmployeeId ??
                                                index;

                                            const name =
                                                `${emp.firstName ?? emp.FirstName ?? ""} ${emp.lastName ?? emp.LastName ?? ""}`.trim();

                                            return (
                                                <option key={id} value={id}>
                                                    {name || id}
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
                                    Delete Employee Subscription
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeDeleteModal}
                                />
                            </div>

                            <div className="modal-body">
                                Are you sure you want to delete this employee subscription?
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