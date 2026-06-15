import { useEffect, useState } from "react";

import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    type LocationType,
} from "../Services/LocationService";

import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/ErrorModal";

function Location() {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [locationName, setLocationName] = useState("");
    const [street, setStreet] = useState("");
    const [pinCode, setPinCode] = useState("");

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LocationType | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const loadLocations = async () => {
        try {
            const data = await getLocations();
            setLocations(Array.isArray(data) ? data : []);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLocations();
    }, []);

    const clearForm = () => {
        setLocationName("");
        setStreet("");
        setPinCode("");
        setEditId(null);
    };

    const openAddModal = () => {
        clearForm();
        setShowFormModal(true);
    };

    const openEditModal = (location: LocationType) => {
        console.log(location);
        setEditId(location.locationID);
        setLocationName(location.locationName);
        setStreet(location.street);
        setPinCode(location.pinCode);
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        clearForm();
        setShowFormModal(false);
    };

    const handleSubmit = async () => {
        if (!locationName.trim() || !street.trim() || !pinCode.trim()) {
            closeFormModal();
            setErrorMessage("All fields are required.");
            return;
        }

        const locationData = {
            locationName,
            street,
            pinCode,
        };

        setLoading(true);

        try {
            if (editId === null) {
                await createLocation(locationData);
            } else {
                await updateLocation(editId, locationData);
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

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Location Management</h2>

                <button
                    className="btn btn-success"
                    onClick={openAddModal}
                >
                    Add Location
                </button>
            </div>

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
                    {locations.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">
                                No locations found.
                            </td>
                        </tr>
                    ) : (
                        locations.map((location, index) => (
                            <tr key={location.locationID || index}>
                                <td>{location.locationName}</td>
                                <td>{location.street}</td>
                                <td>{location.pinCode}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm me-2"
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
                                <div className="mb-3">
                                    <label className="form-label">Location Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={locationName}
                                        onChange={(e) =>
                                            setLocationName(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Street</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={street}
                                        onChange={(e) =>
                                            setStreet(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={pinCode}
                                        onChange={(e) =>
                                            setPinCode(e.target.value)
                                        }
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