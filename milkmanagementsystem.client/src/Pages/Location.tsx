import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    type LocationType,
} from "../Services/LocationService";

import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import { handleApiSuccess } from "../Helpers/successHandler";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";

function Location() {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();

    const [locationName, setLocationName] = useState("");
    const [street, setStreet] = useState("");
    const [pinCode, setPinCode] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LocationType | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formError, setFormError] = useState("");

    const [oldLocationName, setOldLocationName] = useState("");
    const [oldStreet, setOldStreet] = useState("");
    const [oldPinCode, setOldPinCode] = useState("");

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const recordsPerPage = 10;

    const loadLocations = async () => {
        try {
            setLoading(true);
            const data = await getLocations();
            setLocations(Array.isArray(data) ? [...data].reverse() : []);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLocations();
    }, []);

    const filteredLocations = locations.filter((location) =>
        location.locationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(
        filteredLocations.length / recordsPerPage
    );

    const currentLocations = filteredLocations.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const clearForm = () => {
        setLocationName("");
        setStreet("");
        setPinCode("");
        setEditId(null);
    };

    const openAddModal = () => {
        clearForm();
        setFormError("");
        setShowFormModal(true);
    };

    const openEditModal = (location: LocationType) => {
        setEditId(location.locationID);
        setLocationName(location.locationName);
        setStreet(location.street);
        setPinCode(location.pinCode);
        setOldLocationName(location.locationName);
        setOldStreet(location.street);
        setOldPinCode(location.pinCode);
        setFormError("");
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        clearForm();
        setFormError("");
        setShowFormModal(false);
    };

    const handleSubmit = async () => {
        // All validation errors now show INSIDE the modal (formError)
        // instead of closing the modal + showing the global ErrorModal.
        if (!locationName.trim() || !street.trim() || !pinCode.trim()) {
            setFormError("All fields are required.");
            return;
        }
        if (!/^\d{6}$/.test(pinCode)) {
            setFormError("Pincode must be 6 digits.");
            return;
        }
        if (
            editId !== null &&
            locationName === oldLocationName &&
            street === oldStreet &&
            pinCode === oldPinCode
        ) {
            setFormError("Please update at least one field.");
            return;
        }

        const isLocationNameDuplicate = locations.some(
            (x) =>
                x.locationName.toLowerCase().trim() ===
                locationName.toLowerCase().trim() &&
                x.locationID !== editId
        );
        if (isLocationNameDuplicate) {
            setFormError("Location name already exists.");
            return;
        }

        const isStreetDuplicate = locations.some(
            (x) =>
                x.street.toLowerCase().trim() === street.toLowerCase().trim() &&
                x.locationID !== editId
        );
        if (isStreetDuplicate) {
            setFormError("Street already exists.");
            return;
        }

        
        const locationData = { locationName, street, pinCode };

        setLoading(true);

        try {
            if (editId === null) {
                await createLocation(locationData);
                handleApiSuccess("Location Created Successfully", setsuccessMessage);
            } else {
                await updateLocation(editId, locationData);
                handleApiSuccess("Location Updated Successfully", setsuccessMessage);
            }

            closeFormModal();
            await loadLocations();
        } catch (error) {
            closeFormModal();
            setErrorMessage(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (location: LocationType) => {
        setDeleteTarget(location);
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
            await deleteLocation(deleteTarget.locationID);
            handleApiSuccess("Location Deleted Successfully", setsuccessMessage);
            closeDeleteModal();
            await loadLocations();
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
                <h2>Location Management</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => Navigate("/dashboard")}
                    >
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        Add Location
                    </button>
                </div>
            </div>

            <div className="mb-3" style={{ maxWidth: "400px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search location..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <Loader text="Loading Location..." />
            ) : (
                <>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Location Name</th>
                                <th>Street</th>
                                <th>Pincode</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentLocations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        No locations found.
                                    </td>
                                </tr>
                            ) : (
                                currentLocations.map((location, index) => (
                                    <tr key={location.locationID || index}>
                                        <td>{location.locationName}</td>
                                        <td>{location.street}</td>
                                        <td>{location.pinCode}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => openEditModal(location)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => openDeleteModal(location)}
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
                                    {editId === null ? "Add Location" : "Edit Location"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeFormModal}
                                />
                            </div>

                            <div className="modal-body">
                                {formError && (
                                    <div className="alert alert-danger mb-3">
                                        {formError}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Location Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={locationName}
                                        onChange={(e) => {
                                            setLocationName(e.target.value);
                                            setFormError("");
                                        }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Street</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={street}
                                        onChange={(e) => {
                                            setStreet(e.target.value);
                                            setFormError("");
                                        }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={pinCode}
                                        onChange={(e) => {
                                            setPinCode(e.target.value);
                                            setFormError("");
                                        }}
                                    />
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
                                <h5 className="modal-title">Delete Location</h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeDeleteModal}
                                />
                            </div>

                            <div className="modal-body">
                                Are you sure you want to delete{" "}
                                <strong>{deleteTarget?.locationName}</strong>?
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

export default Location;