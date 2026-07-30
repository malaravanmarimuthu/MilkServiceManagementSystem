/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    type SubscriptionType,
} from "../Services/SubscriptionService";

import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import { handleApiSuccess } from "../Helpers/successHandler";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

type FormErrors = {
    milkType?: string;
    pricePerLiter?: string;
};

interface JwtPayload {
    userid: string;
    firstname: string;
    rolename: string;
}

function Subscription() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();

    const [milkType, setMilkType] = useState("");
    const [pricePerLiter, setPricePerLiter] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SubscriptionType | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [oldMilkType, setOldMilkType] = useState("");
    const [oldPricePerLiter, setOldPricePerLiter] = useState("");

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const recordsPerPage = 10;

    const token = localStorage.getItem("token");
    let isAdmin = false;
    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        isAdmin = decoded.rolename?.toLowerCase() === "admin";
    }

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await getSubscriptions();
            setSubscriptions(Array.isArray(data) ? [...data].reverse() : []);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const filteredSubscriptions = subscriptions.filter((sub) =>
        sub.milkType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSubscriptions.length / recordsPerPage);

    const currentSubscriptions = filteredSubscriptions.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const clearForm = () => {
        setMilkType("");
        setPricePerLiter("");
        setEditId(null);
        setFormError("");
        setErrors({});
        setOldMilkType("");
        setOldPricePerLiter("");
    };

    const openAddModal = () => {
        clearForm();
        setShowFormModal(true);
    };

    const openEditModal = (subscription: SubscriptionType) => {
        setEditId(subscription.subscriptionID);
        setMilkType(subscription.milkType);
        setPricePerLiter(subscription.pricePerLiter.toString());

        setOldMilkType(subscription.milkType);
        setOldPricePerLiter(subscription.pricePerLiter.toString());

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

        if (!milkType.trim()) {
            newErrors.milkType = "Milk Type is required.";
        }

        if (!pricePerLiter.trim()) {
            newErrors.pricePerLiter = "Price is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setFormError("");

        if (!validateForm()) return;

        if (isNaN(Number(pricePerLiter)) || Number(pricePerLiter) <= 0) {
            setErrors({ pricePerLiter: "Price must be a valid positive number." });
            return;
        }

        if (
            editId !== null &&
            milkType === oldMilkType &&
            pricePerLiter === oldPricePerLiter
        ) {
            setFormError("Please update at least one field.");
            return;
        }

        const subscriptionData = {
            milkType,
            quantity: 1,
            pricePerLiter: Number(pricePerLiter),
        };

        setLoading(true);

        try {
            if (editId === null) {
                await createSubscription(subscriptionData);
                handleApiSuccess("Subscription Created Successfully", setsuccessMessage);
            } else {
                await updateSubscription(editId, subscriptionData);
                handleApiSuccess("Subscription Updated Successfully", setsuccessMessage);
            }

            closeFormModal();
            await loadSubscriptions();
        } catch (error) {
            closeFormModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (subscription: SubscriptionType) => {
        setDeleteTarget(subscription);
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
            await deleteSubscription(deleteTarget.subscriptionID);
            handleApiSuccess("Subscription Deleted Successfully", setsuccessMessage);
            closeDeleteModal();
            await loadSubscriptions();
        } catch (error) {
            closeDeleteModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <ErrorModal message={errorMessage} onClose={() => setErrorMessage("")} />
            <SuccessModal message={successMessage} onClose={() => setsuccessMessage("")} />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Subscription Management</h2>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => Navigate("/dashboard")}
                    >
                        Cancel
                    </button>

                    {isAdmin && (
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Subscription
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-3" style={{ maxWidth: "400px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search milk type..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <Loader text="Loading Subscriptions..." />
            ) : (
                <>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Milk Type</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                {isAdmin && <th>Action</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {currentSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="text-center">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                currentSubscriptions.map((subscription, index) => (
                                    <tr key={subscription.subscriptionID || index}>
                                        <td>{subscription.milkType}</td>
                                        <td>{subscription.quantity}</td>
                                        <td>{subscription.pricePerLiter}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => openEditModal(subscription)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => openDeleteModal(subscription)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
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

            {/* Form Modal  */}
            {isAdmin && showFormModal && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editId === null ? "Add Subscription" : "Edit Subscription"}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeFormModal} />
                            </div>

                            <div className="modal-body">
                                <div className="mb-2">
                                    <span className="text-danger fw-bold">*</span>{" "}
                                    <span className="text-muted small">indicates mandatory fields</span>
                                </div>

                                {formError && (
                                    <div className="alert alert-danger mb-3">{formError}</div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Milk Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.milkType ? "is-invalid" : ""}`}
                                        value={milkType}
                                        onChange={(e) => {
                                            setMilkType(e.target.value);
                                            setErrors(prev => ({ ...prev, milkType: undefined }));
                                            setFormError("");
                                        }}
                                    >
                                        <option value="">-- Select Milk Type --</option>
                                        <option value="Cow">Cow</option>
                                        <option value="Buffalo">Buffalo</option>
                                    </select>
                                    {errors.milkType && (
                                        <span className="text-danger small">{errors.milkType}</span>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value="1 Liter"
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Price <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors.pricePerLiter ? "is-invalid" : ""}`}
                                        value={pricePerLiter}
                                        onChange={(e) => {
                                            setPricePerLiter(e.target.value);
                                            setErrors(prev => ({ ...prev, pricePerLiter: undefined }));
                                            setFormError("");
                                        }}
                                    />
                                    {errors.pricePerLiter && (
                                        <span className="text-danger small">{errors.pricePerLiter}</span>
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
                                    {loading ? "Saving..." : editId === null ? "Save" : "Update"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal  */}
            {isAdmin && showDeleteModal && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Delete Subscription</h5>
                                <button type="button" className="btn-close" onClick={closeDeleteModal} />
                            </div>

                            <div className="modal-body">
                                Are you sure you want to delete the{" "}
                                <strong>{deleteTarget?.milkType}</strong> subscription?
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

export default Subscription;