/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
    getEmployees,
    updateEmployeeLocation,
    uploadEmployeePhoto,
    deleteEmployeeLocation,
    deleteEmployeePhoto,
} from "../Services/EmployeeService";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";
import { useNavigate } from "react-router-dom";

type ModalMode = "add" | "edit" | null;

const EmployeeLocationPhoto: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [modalEmpId, setModalEmpId] = useState<number | "">("");

    // Staged (unsaved) changes inside the modal
    const [pendingLat, setPendingLat] = useState<number | null>(null);
    const [pendingLng, setPendingLng] = useState<number | null>(null);
    const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
    const [pendingPhotoPreview, setPendingPhotoPreview] = useState<string | null>(null);

    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirLoading, setDirLoading] = useState(false);
    const [listDirLoadingId, setListDirLoadingId] = useState<number | null>(null);

    const [showDeleteLocationConfirm, setShowDeleteLocationConfirm] = useState(false);
    const [deleteLocationTargetId, setDeleteLocationTargetId] = useState<number | null>(null);

    const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
    const [deletePhotoTargetId, setDeletePhotoTargetId] = useState<number | null>(null);

    const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
    const [viewPhotoName, setViewPhotoName] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            const data: any = res.data;
            const arr = Array.isArray(data) ? data : data?.$values ?? data?.data ?? [];
            setEmployees(arr);
        } catch {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const getEmpId = (e: any) => e.id ?? e.ID ?? e.Id;
    const getEmpName = (e: any) =>
        `${e.firstName ?? e.FirstName ?? ""} ${e.lastName ?? e.LastName ?? ""}`.trim();
    const getEmpPhoto = (e: any) => e.photourl ?? e.Photourl;
    const getEmpLat = (e: any) => Number(e.latitude ?? e.Latitude ?? 0);
    const getEmpLng = (e: any) => Number(e.longitude ?? e.Longitude ?? 0);
    const hasLoc = (e: any) =>
        !!(e.latitude ?? e.Latitude) && !!(e.longitude ?? e.Longitude);

    const modalEmployee = employees.find((e: any) => getEmpId(e) === modalEmpId);
    const modalHasPhoto = !!(modalEmployee && getEmpPhoto(modalEmployee));
    const modalHasLocation = !!(modalEmployee && hasLoc(modalEmployee));

    // Users available in the "Add" dropdown — only those without a location yet
    const usersWithoutLocation = employees.filter((e) => !hasLoc(e));

    // Full list shown in the table — every user, filtered by the search box
    const filteredUsers = employees.filter((e) =>
        getEmpName(e).toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    // ---- Modal open/close ----
    const resetPending = () => {
        setPendingLat(null);
        setPendingLng(null);
        setPendingPhotoFile(null);
        if (pendingPhotoPreview) URL.revokeObjectURL(pendingPhotoPreview);
        setPendingPhotoPreview(null);
    };

    const openAddModal = () => {
        resetPending();
        setModalMode("add");
        setModalEmpId("");
    };

    const openEditModal = (emp: any) => {
        resetPending();
        setModalMode("edit");
        setModalEmpId(getEmpId(emp));
    };

    const closeModal = () => {
        resetPending();
        setModalMode(null);
        setModalEmpId("");
    };

    // ---- Stage a new location (not saved yet) ----
    const handleStageLocation = () => {
        if (!modalEmpId) return setError("Select a user first.");
        if (!navigator.geolocation) return setError("Geolocation not supported.");

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setPendingLat(position.coords.latitude);
                setPendingLng(position.coords.longitude);
                setFetchingLocation(false);
            },
            () => {
                setError("Unable to fetch location. Please allow location access.");
                setFetchingLocation(false);
            }
        );
    };

    // ---- Stage a new photo (not saved yet) ----
    const handleChoosePhoto = () => {
        if (!modalEmpId) return setError("Select a user first.");
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (pendingPhotoPreview) URL.revokeObjectURL(pendingPhotoPreview);
        setPendingPhotoFile(file);
        setPendingPhotoPreview(URL.createObjectURL(file));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ---- Save (commits staged location + photo together) ----
    const isSaveDisabled =
        !modalEmpId || saving || (pendingLat === null && !pendingPhotoFile);

    const handleSave = async () => {
        if (!modalEmpId) return setError("Select a user first.");
        setSaving(true);
        try {
            if (pendingLat !== null && pendingLng !== null) {
                await updateEmployeeLocation(modalEmpId as number, pendingLat, pendingLng);
            }
            if (pendingPhotoFile) {
                await uploadEmployeePhoto(modalEmpId as number, pendingPhotoFile);
            }
            setSuccessMessage("Saved successfully!");
            await fetchEmployees();
            closeModal();
        } catch {
            setError("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    // ---- Directions ----
    const openDirections = (
        lat: number,
        lng: number,
        setLoadingFn: (v: boolean) => void
    ) => {
        if (!navigator.geolocation) {
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
            return;
        }
        setLoadingFn(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${lat},${lng}`;
                window.open(url, "_blank");
                setLoadingFn(false);
            },
            () => {
                const url = `https://www.google.com/maps?q=${lat},${lng}`;
                window.open(url, "_blank");
                setLoadingFn(false);
            }
        );
    };

    const handleModalDirection = () => {
        if (!modalHasLocation) return;
        openDirections(getEmpLat(modalEmployee), getEmpLng(modalEmployee), setDirLoading);
    };

    const handleListDirection = (emp: any) => {
        const id = getEmpId(emp);
        setListDirLoadingId(id);
        openDirections(getEmpLat(emp), getEmpLng(emp), () => setListDirLoadingId(null));
    };

    // ---- Location delete (immediate — separate from Save) ----
    const confirmDeleteLocationFor = (id: number | "") => {
        if (!id) return;
        setDeleteLocationTargetId(id as number);
        setShowDeleteLocationConfirm(true);
    };

    const [deletingLocation, setDeletingLocation] = useState(false);
    const handleDeleteLocation = async () => {
        if (!deleteLocationTargetId) return;
        setDeletingLocation(true);
        try {
            await deleteEmployeeLocation(deleteLocationTargetId);
            setSuccessMessage("Location removed!");
            fetchEmployees();
        } catch {
            setError("Failed to remove location");
        } finally {
            setDeletingLocation(false);
            setShowDeleteLocationConfirm(false);
            setDeleteLocationTargetId(null);
        }
    };

    // ---- Photo delete (immediate — separate from Save, small "✕" on thumbnail) ----
    const confirmDeletePhotoFor = (id: number) => {
        setDeletePhotoTargetId(id);
        setShowDeletePhotoConfirm(true);
    };

    const [deletingPhoto, setDeletingPhoto] = useState(false);
    const handleDeletePhoto = async () => {
        if (!deletePhotoTargetId) return;
        setDeletingPhoto(true);
        try {
            await deleteEmployeePhoto(deletePhotoTargetId);
            setSuccessMessage("Photo removed!");
            fetchEmployees();
        } catch {
            setError("Failed to remove photo");
        } finally {
            setDeletingPhoto(false);
            setShowDeletePhotoConfirm(false);
            setDeletePhotoTargetId(null);
        }
    };

    // ---- View photo (enlarge) ----
    const openViewPhoto = (emp: any) => {
        const url = getEmpPhoto(emp);
        if (!url) return;
        setViewPhotoUrl(url);
        setViewPhotoName(getEmpName(emp));
    };

    return (
        <>
            <style>{`
                .elp-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    padding: 28px;
                }
                .elp-select {
                    border-radius: 10px;
                    padding: 10px 14px;
                    border: 1px solid #dcdcdc;
                    width: 100%;
                    font-size: 0.95rem;
                }
                .elp-btn {
                    border-radius: 100px;
                    padding: 8px 16px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                    white-space: nowrap;
                }
                .elp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .elp-btn-location { background: #1B4332; color: #fff; }
                .elp-btn-location:hover { background: #14532d; }
                .elp-btn-direction { background: #1d4ed8; color: #fff; }
                .elp-btn-direction:hover { background: #1e40af; }
                .elp-btn-photo { background: #4895ef; color: #fff; }
                .elp-btn-photo:hover { background: #3579d1; }
                .elp-btn-view { background: #f1f0ff; color: #5b3ce0; }
                .elp-btn-view:hover { background: #e3dfff; }
                .elp-btn-update { background: #fff3cd; color: #8a6414; }
                .elp-btn-update:hover { background: #ffe9a8; }
                .elp-btn-add-loc { background: #e8f5e9; color: #1B4332; }
                .elp-btn-add-loc:hover { background: #d3ecd6; }
                .elp-btn-del-loc { background: #fdeaea; color: #c0392b; }
                .elp-btn-del-loc:hover { background: #f8d0d0; }
                .elp-btn-cancel { background: #f1f3f5; color: #495057; }
                .elp-btn-cancel:hover { background: #e9ecef; }
                .elp-btn-add {
                    background: #1B4332;
                    color: #fff;
                    border-radius: 100px;
                    padding: 10px 22px;
                    font-weight: 700;
                    font-size: 0.92rem;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .elp-btn-add:hover { background: #14532d; }
                .elp-btn-save {
                    background: #1B4332;
                    color: #fff;
                    border-radius: 100px;
                    padding: 10px 26px;
                    font-weight: 700;
                    font-size: 0.92rem;
                    border: none;
                    cursor: pointer;
                }
                .elp-btn-save:hover:not(:disabled) { background: #14532d; }
                .elp-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                .elp-coords {
                    font-size: 0.83rem;
                    color: #6c757d;
                }

                /* --- Table section --- */
                .elp-table-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 18px;
                }
                .elp-table-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1B4332;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                }
                .elp-search-wrap {
                    position: relative;
                    min-width: 260px;
                }
                .elp-search-input {
                    border-radius: 10px;
                    padding: 9px 14px 9px 36px;
                    border: 1px solid #dcdcdc;
                    width: 100%;
                    font-size: 0.9rem;
                }
                .elp-search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #adb5bd;
                    font-size: 0.9rem;
                }
                .elp-table thead th {
                    background: #1B4332;
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.88rem;
                    padding: 14px 16px;
                    white-space: nowrap;
                }
                .elp-table tbody td {
                    padding: 12px 16px;
                    vertical-align: middle;
                    font-size: 0.9rem;
                }
                .elp-table tbody tr:nth-child(even) { background: #fafbfa; }
                .elp-table tbody tr:hover { background: #f1f8f2; }
                .elp-user-name {
                    font-weight: 600;
                    color: #212529;
                }
                .elp-muted-text {
                    color: #adb5bd;
                    font-size: 0.85rem;
                }
                .elp-actions-cell {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .elp-empty-state {
                    text-align: center;
                    color: #adb5bd;
                    padding: 40px 0;
                    font-size: 0.95rem;
                }

                /* --- Update/Add modal --- */
                .elp-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2100;
                    padding: 20px;
                }
                .elp-modal-content {
                    background: #fff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 460px;
                    max-height: 88vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .elp-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 22px;
                    border-bottom: 1px solid #eef0f2;
                }
                .elp-modal-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #1B4332;
                    margin: 0;
                }
                .elp-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: #868e96;
                    cursor: pointer;
                    line-height: 1;
                }
                .elp-modal-body {
                    padding: 22px;
                }
                .elp-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 22px;
                    border-top: 1px solid #eef0f2;
                }
                .elp-modal-section-label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #868e96;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    margin-bottom: 8px;
                }
                .elp-pending-note {
                    background: #fff8e1;
                    border: 1px solid #ffe082;
                    color: #8a6414;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 0.82rem;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                .elp-pending-discard {
                    background: none;
                    border: none;
                    color: #8a6414;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .elp-modal-photo-preview {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #1B4332;
                    cursor: pointer;
                }

                /* --- Photo view modal --- */
                .elp-photo-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2200;
                    padding: 24px;
                }
                .elp-photo-modal-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 85vh;
                    text-align: center;
                }
                .elp-photo-modal-img {
                    max-width: 90vw;
                    max-height: 75vh;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }
                .elp-photo-modal-name {
                    color: #fff;
                    font-weight: 600;
                    margin-top: 12px;
                    font-size: 1rem;
                }
                .elp-photo-modal-close {
                    position: absolute;
                    top: -18px;
                    right: -18px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #fff;
                    color: #212529;
                    border: none;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                @media (max-width: 576px) {
                    .elp-card { padding: 18px; border-radius: 12px; }
                    .elp-btn-add { width: 100%; justify-content: center; padding: 12px; }
                    .elp-search-wrap { width: 100%; }
                    .elp-modal-content { max-width: 100%; }
                    .elp-photo-modal-close { top: -14px; right: 0; }
                }
            `}</style>

            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={successMessage} onClose={() => setSuccessMessage("")} />

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            <div className="container-fluid mt-3 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h2 className="mb-0">User Location &amp; Photo</h2>
                    <div className="d-flex gap-2">
                        <button className="elp-btn-add" onClick={openAddModal}>
                            ＋ Add
                        </button>
                        <button className="btn btn-danger" onClick={() => navigate("/employee")}>Back</button>
                    </div>
                </div>

                {loading ? <Loader /> : (
                    <div className="elp-card">
                        <div className="elp-table-toolbar">
                            <h5 className="elp-table-title">
                                👥 Users ({filteredUsers.length})
                            </h5>
                            <div className="elp-search-wrap">
                                <span className="elp-search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="elp-search-input"
                                    placeholder="Search by user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="elp-empty-state">No users found.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table elp-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Location</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((emp: any) => {
                                            const id = getEmpId(emp);
                                            const photo = getEmpPhoto(emp);
                                            const empHasLoc = hasLoc(emp);
                                            return (
                                                <tr key={id}>
                                                    <td>
                                                        <span className="elp-user-name">{getEmpName(emp)}</span>
                                                    </td>
                                                    <td>
                                                        {empHasLoc ? (
                                                            <span className="elp-coords">
                                                                📍 {getEmpLat(emp).toFixed(5)}, {getEmpLng(emp).toFixed(5)}
                                                            </span>
                                                        ) : (
                                                            <span className="elp-muted-text">Not set</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="elp-actions-cell">
                                                            {/* Direction always comes first */}
                                                            {empHasLoc && (
                                                                <button
                                                                    className="elp-btn elp-btn-direction"
                                                                    onClick={() => handleListDirection(emp)}
                                                                    disabled={listDirLoadingId === id}
                                                                >
                                                                    {listDirLoadingId === id ? "Opening..." : "🗺 Direction"}
                                                                </button>
                                                            )}

                                                            {photo && (
                                                                <button
                                                                    className="elp-btn elp-btn-view"
                                                                    onClick={() => openViewPhoto(emp)}
                                                                >
                                                                    🖼 View Photo
                                                                </button>
                                                            )}

                                                            <button
                                                                className={`elp-btn ${empHasLoc ? "elp-btn-update" : "elp-btn-add-loc"}`}
                                                                onClick={() => openEditModal(emp)}
                                                            >
                                                                {empHasLoc ? "✎ Update" : "＋ Add Location"}
                                                            </button>

                                                            {empHasLoc && (
                                                                <button
                                                                    className="elp-btn elp-btn-del-loc"
                                                                    onClick={() => confirmDeleteLocationFor(id)}
                                                                >
                                                                    🗑 Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ---- Add / Edit modal ---- */}
            {modalMode !== null && (
                <div className="elp-modal-backdrop" onClick={closeModal}>
                    <div className="elp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="elp-modal-header">
                            <h5 className="elp-modal-title">
                                {modalMode === "add" ? "Add User Location" : "Update User"}
                            </h5>
                            <button className="elp-modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <div className="elp-modal-body">
                            {modalMode === "add" ? (
                                <>
                                    <div className="elp-modal-section-label">Select User</div>
                                    <select
                                        className="elp-select"
                                        value={modalEmpId}
                                        onChange={(e) => {
                                            resetPending();
                                            setModalEmpId(e.target.value ? Number(e.target.value) : "");
                                        }}
                                    >
                                        <option value="">-- Select User --</option>
                                        {usersWithoutLocation.map((emp: any) => {
                                            const id = getEmpId(emp);
                                            return (
                                                <option key={id} value={id}>
                                                    {getEmpName(emp)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {usersWithoutLocation.length === 0 && (
                                        <div className="text-muted small mt-2">
                                            Every user already has a location added.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="fw-semibold mb-2" style={{ fontSize: "1.05rem" }}>
                                    {modalEmployee ? getEmpName(modalEmployee) : ""}
                                </div>
                            )}

                            {modalEmpId !== "" && (
                                <>
                                    {/* Location section */}
                                    <div className="mt-4">
                                        <div className="elp-modal-section-label">Location</div>
                                        {modalHasLocation ? (
                                            <div className="elp-coords mb-2">
                                                📍 {getEmpLat(modalEmployee).toFixed(5)}, {getEmpLng(modalEmployee).toFixed(5)}
                                            </div>
                                        ) : (
                                            <div className="elp-muted-text mb-2">No location set yet</div>
                                        )}

                                        <div className="d-flex gap-2 flex-wrap">
                                            <button
                                                className="elp-btn elp-btn-location"
                                                onClick={handleStageLocation}
                                                disabled={fetchingLocation}
                                            >
                                                {fetchingLocation ? "Fetching..." : modalHasLocation ? "📍 Update Location" : "📍 Get Current Location"}
                                            </button>

                                            {modalHasLocation && (
                                                <button
                                                    className="elp-btn elp-btn-direction"
                                                    onClick={handleModalDirection}
                                                    disabled={dirLoading}
                                                >
                                                    {dirLoading ? "Opening..." : "🗺 Direction"}
                                                </button>
                                            )}

                                            {modalHasLocation && (
                                                <button
                                                    className="elp-btn elp-btn-del-loc"
                                                    onClick={() => confirmDeleteLocationFor(modalEmpId)}
                                                >
                                                    🗑 Remove Location
                                                </button>
                                            )}
                                        </div>

                                        {pendingLat !== null && pendingLng !== null && (
                                            <div className="elp-pending-note">
                                                <span>New location ready: {pendingLat.toFixed(5)}, {pendingLng.toFixed(5)} (unsaved)</span>
                                                <button
                                                    className="elp-pending-discard"
                                                    onClick={() => { setPendingLat(null); setPendingLng(null); }}
                                                >Discard</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Photo section */}
                                    <div className="mt-4">
                                        <div className="elp-modal-section-label">Photo</div>
                                        <div className="d-flex align-items-center gap-3">
                                            {pendingPhotoPreview ? (
                                                <img src={pendingPhotoPreview} alt="preview" className="elp-modal-photo-preview" />
                                            ) : modalHasPhoto ? (
                                                <img
                                                    src={getEmpPhoto(modalEmployee)}
                                                    alt="user"
                                                    className="elp-modal-photo-preview"
                                                    onClick={() => openViewPhoto(modalEmployee)}
                                                />
                                            ) : (
                                                <div className="elp-muted-text">No photo yet</div>
                                            )}

                                            <button className="elp-btn elp-btn-photo" onClick={handleChoosePhoto}>
                                                📷 Choose New Photo
                                            </button>

                                            {modalHasPhoto && !pendingPhotoPreview && (
                                                <button
                                                    className="elp-btn elp-btn-del-loc"
                                                    onClick={() => confirmDeletePhotoFor(modalEmpId as number)}
                                                >
                                                    🗑 Remove Photo
                                                </button>
                                            )}
                                        </div>

                                        {pendingPhotoFile && (
                                            <div className="elp-pending-note">
                                                <span>New photo ready to save (unsaved)</span>
                                                <button
                                                    className="elp-pending-discard"
                                                    onClick={() => {
                                                        if (pendingPhotoPreview) URL.revokeObjectURL(pendingPhotoPreview);
                                                        setPendingPhotoFile(null);
                                                        setPendingPhotoPreview(null);
                                                    }}
                                                >Discard</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="elp-modal-footer">
                            <button className="elp-btn elp-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="elp-btn-save" onClick={handleSave} disabled={isSaveDisabled}>
                                {saving ? "Saving..." : "💾 Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enlarged photo view */}
            {viewPhotoUrl && (
                <div
                    className="elp-photo-modal-backdrop"
                    onClick={() => setViewPhotoUrl(null)}
                >
                    <div className="elp-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="elp-photo-modal-close"
                            onClick={() => setViewPhotoUrl(null)}
                        >✕</button>
                        <img src={viewPhotoUrl} alt={viewPhotoName} className="elp-photo-modal-img" />
                        <div className="elp-photo-modal-name">{viewPhotoName}</div>
                    </div>
                </div>
            )}

            {showDeleteLocationConfirm && (
                <ConfirmModal
                    title="Remove Location"
                    message="Are you sure you want to remove this user's location?"
                    confirmText={deletingLocation ? "Removing..." : "Remove"}
                    isLoading={deletingLocation}
                    onConfirm={handleDeleteLocation}
                    onClose={() => {
                        setShowDeleteLocationConfirm(false);
                        setDeleteLocationTargetId(null);
                    }}
                />
            )}

            {showDeletePhotoConfirm && (
                <ConfirmModal
                    title="Remove Photo"
                    message="Are you sure you want to remove this user's photo?"
                    confirmText={deletingPhoto ? "Removing..." : "Remove"}
                    isLoading={deletingPhoto}
                    onConfirm={handleDeletePhoto}
                    onClose={() => {
                        setShowDeletePhotoConfirm(false);
                        setDeletePhotoTargetId(null);
                    }}
                />
            )}
        </>
    );
};

export default EmployeeLocationPhoto;