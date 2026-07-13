/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
    getRates,
    addRate,
    updateRate,
    deleteRate,
    type ProcurementRateDto,
} from "../Services/ProcurementRateService";

import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import { handleApiSuccess } from "../Helpers/successHandler";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

type FormErrors = {
    milkType?: string;
    rate?: string;
};

interface JwtPayload {
    userid: string;
    firstname: string;
    rolename: string;
}

function ProcurementRate() {
    const [rates, setRates] = useState<ProcurementRateDto[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();

    const [milkType, setMilkType] = useState("");
    const [rate, setRate] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProcurementRateDto | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [oldMilkType, setOldMilkType] = useState("");
    const [oldRate, setOldRate] = useState("");

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const recordsPerPage = 10;

    const token = localStorage.getItem("token");
    let isAdmin = false;
    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        isAdmin = decoded.rolename?.toLowerCase() === "admin";
    }

    const loadRates = async () => {
        try {
            setLoading(true);
            const data = await getRates();
            setRates(Array.isArray(data) ? [...data].reverse() : []);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRates();
    }, []);

    const filteredRates = rates.filter((r) =>
        r.milkType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRates.length / recordsPerPage);

    const currentRates = filteredRates.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const clearForm = () => {
        setMilkType("");
        setRate("");
        setEditId(null);
        setFormError("");
        setErrors({});
        setOldMilkType("");
        setOldRate("");
    };

    const openAddModal = () => {
        clearForm();
        setShowFormModal(true);
    };

    const openEditModal = (rateItem: ProcurementRateDto) => {
        setEditId(rateItem.id);
        setMilkType(rateItem.milkType);
        setRate(rateItem.rate.toString());

        setOldMilkType(rateItem.milkType);
        setOldRate(rateItem.rate.toString());

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

        if (!rate.trim()) {
            newErrors.rate = "Rate is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setFormError("");

        if (!validateForm()) return;

        if (isNaN(Number(rate)) || Number(rate) <= 0) {
            setErrors({ rate: "Rate must be a valid positive number." });
            return;
        }

        if (
            editId !== null &&
            milkType === oldMilkType &&
            rate === oldRate
        ) {
            setFormError("Please update at least one field.");
            return;
        }

        setLoading(true);

        try {
            if (editId === null) {
                await addRate({ milkType, rate: Number(rate) });
                handleApiSuccess("Rate Added Successfully", setsuccessMessage);
            } else {
                await updateRate({ id: editId, milkType, rate: Number(rate) });
                handleApiSuccess("Rate Updated Successfully", setsuccessMessage);
            }

            closeFormModal();
            await loadRates();
        } catch (error) {
            closeFormModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (rateItem: ProcurementRateDto) => {
        setDeleteTarget(rateItem);
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
            await deleteRate(deleteTarget.id);
            handleApiSuccess("Rate Deleted Successfully", setsuccessMessage);
            closeDeleteModal();
            await loadRates();
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
                <h2>Procurement Price Management</h2>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => Navigate("/dashboard")}
                    >
                        Cancel
                    </button>

                    {isAdmin && (
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Rate
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
                <Loader text="Loading Rates..." />
            ) : (
                <>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Milk Type</th>
                                <th>Rate (per liter)</th>
                                {isAdmin && <th>Action</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {currentRates.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 3 : 2} className="text-center">
                                        No rates found.
                                    </td>
                                </tr>
                            ) : (
                                currentRates.map((rateItem, index) => (
                                    <tr key={rateItem.id || index}>
                                        <td>{rateItem.milkType}</td>
                                        <td>{rateItem.rate.toFixed(2)}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => openEditModal(rateItem)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => openDeleteModal(rateItem)}
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

            {/* Form Modal - Admin only */}
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
                                    {editId === null ? "Add Rate" : "Edit Rate"}
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
                                    <label className="form-label">
                                        Rate (per liter) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors.rate ? "is-invalid" : ""}`}
                                        value={rate}
                                        onChange={(e) => {
                                            setRate(e.target.value);
                                            setErrors(prev => ({ ...prev, rate: undefined }));
                                            setFormError("");
                                        }}
                                    />
                                    {errors.rate && (
                                        <span className="text-danger small">{errors.rate}</span>
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

            {/* Delete Modal - Admin only */}
            {isAdmin && showDeleteModal && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Delete Rate</h5>
                                <button type="button" className="btn-close" onClick={closeDeleteModal} />
                            </div>

                            <div className="modal-body">
                                Are you sure you want to delete the{" "}
                                <strong>{deleteTarget?.milkType}</strong> rate?
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

export default ProcurementRate;