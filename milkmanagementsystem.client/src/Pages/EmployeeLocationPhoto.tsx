/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
    getEmployees,
    updateEmployeeLocation,
    uploadEmployeePhoto,
    deleteEmployeeLocation,
    deleteEmployeePhoto,
} from "../Services/EmployeeService";
import ConfirmModal from "../Components/Common/ConfirmModal";
import Loader from "../Components/Common/Loader";
import { useNavigate } from "react-router-dom";

type Toast = { type: "success" | "error"; message: string } | null;
type DeleteChoice = "location" | "photo";

const EmployeeLocationPhoto: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState<Toast>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [pendingLat, setPendingLat] = useState<number | null>(null);
    const [pendingLng, setPendingLng] = useState<number | null>(null);
    const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
    const [pendingPhotoPreview, setPendingPhotoPreview] = useState<string | null>(null);

    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [saving, setSaving] = useState(false);
    const [listDirLoadingId, setListDirLoadingId] = useState<number | null>(null);

    const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);

    const [showDeleteLocationConfirm, setShowDeleteLocationConfirm] = useState(false);
    const [deleteLocationTargetId, setDeleteLocationTargetId] = useState<number | null>(null);
    const [deletingLocation, setDeletingLocation] = useState(false);

    const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
    const [deletePhotoTargetId, setDeletePhotoTargetId] = useState<number | null>(null);
    const [deletingPhoto, setDeletingPhoto] = useState(false);

    const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
    const [viewPhotoName, setViewPhotoName] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchEmployees(); }, []);

    useEffect(() => {
        return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
    }, []);

    const showToast = (type: "success" | "error", message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            const data: any = res.data;
            const arr = Array.isArray(data) ? data : data?.$values ?? data?.data ?? [];
            setEmployees(arr);
        } catch {
            showToast("error", "Failed to load users");
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

    const filteredUsers = employees.filter((e) =>
        getEmpName(e).toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const expandedEmployee = employees.find((e: any) => getEmpId(e) === expandedId);
    const expandedHasPhoto = !!(expandedEmployee && getEmpPhoto(expandedEmployee));
    const expandedHasLocation = !!(expandedEmployee && hasLoc(expandedEmployee));

    const resetPending = () => {
        setPendingLat(null);
        setPendingLng(null);
        setPendingPhotoFile(null);
        if (pendingPhotoPreview) URL.revokeObjectURL(pendingPhotoPreview);
        setPendingPhotoPreview(null);
    };

    const toggleRow = (emp: any) => {
        const id = getEmpId(emp);
        setDeleteMenuId(null);
        if (expandedId === id) {
            resetPending();
            setExpandedId(null);
        } else {
            resetPending();
            setExpandedId(id);
        }
    };

    const closeRow = () => {
        resetPending();
        setExpandedId(null);
    };

    const handleStageLocation = () => {
        if (!navigator.geolocation) return showToast("error", "Geolocation not supported.");

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setPendingLat(position.coords.latitude);
                setPendingLng(position.coords.longitude);
                setFetchingLocation(false);
            },
            () => {
                showToast("error", "Unable to fetch location. Please allow location access.");
                setFetchingLocation(false);
            }
        );
    };

    const handleChoosePhoto = () => {
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

    const isSaveDisabled = saving || (pendingLat === null && !pendingPhotoFile);

    const handleSave = async () => {
        if (!expandedId) return;
        setSaving(true);
        try {
            if (pendingLat !== null && pendingLng !== null) {
                await updateEmployeeLocation(expandedId, pendingLat, pendingLng);
            }
            if (pendingPhotoFile) {
                await uploadEmployeePhoto(expandedId, pendingPhotoFile);
            }
            showToast("success", "Saved successfully!");
            await fetchEmployees();
            closeRow();
        } catch {
            showToast("error", "Failed to save changes");
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

    const handleListDirection = (emp: any) => {
        const id = getEmpId(emp);
        setListDirLoadingId(id);
        openDirections(getEmpLat(emp), getEmpLng(emp), () => setListDirLoadingId(null));
    };

    // ---- Delete chooser menu ----
    const toggleDeleteMenu = (id: number) => {
        setDeleteMenuId((prev) => (prev === id ? null : id));
    };

    const chooseDelete = (emp: any, choice: DeleteChoice) => {
        const id = getEmpId(emp);
        setDeleteMenuId(null);
        if (choice === "location") {
            setDeleteLocationTargetId(id);
            setShowDeleteLocationConfirm(true);
        } else {
            setDeletePhotoTargetId(id);
            setShowDeletePhotoConfirm(true);
        }
    };

    const handleDeleteLocation = async () => {
        if (!deleteLocationTargetId) return;
        setDeletingLocation(true);
        try {
            await deleteEmployeeLocation(deleteLocationTargetId);
            showToast("success", "Location removed!");
            fetchEmployees();
        } catch {
            showToast("error", "Failed to remove location");
        } finally {
            setDeletingLocation(false);
            setShowDeleteLocationConfirm(false);
            setDeleteLocationTargetId(null);
        }
    };

    const handleDeletePhoto = async () => {
        if (!deletePhotoTargetId) return;
        setDeletingPhoto(true);
        try {
            await deleteEmployeePhoto(deletePhotoTargetId);
            showToast("success", "Photo removed!");
            fetchEmployees();
        } catch {
            showToast("error", "Failed to remove photo");
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

                /* --- Buttons: consistent professional palette --- */
                .elp-btn {
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-weight: 600;
                    font-size: 0.82rem;
                    border: 1px solid transparent;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                    white-space: nowrap;
                    min-width: 128px;
                }
                .elp-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                .elp-btn-direction {
                    background: #fff;
                    color: #1d4ed8;
                    border-color: #b8cbf2;
                }
                .elp-btn-direction:hover:not(:disabled) { background: #eef3ff; }

                .elp-btn-location {
                    background: #1B4332;
                    color: #fff;
                }
                .elp-btn-location:hover:not(:disabled) { background: #14532d; }

                .elp-btn-photo {
                    background: #2f6fed;
                    color: #fff;
                }
                .elp-btn-photo:hover:not(:disabled) { background: #245bcc; }

                .elp-btn-del {
                    background: #fff;
                    color: #c0392b;
                    border-color: #f0b8b8;
                    min-width: 96px;
                }
                .elp-btn-del:hover:not(:disabled) { background: #fdeaea; }

                .elp-btn-cancel { background: #f1f3f5; color: #495057; min-width: auto; }
                .elp-btn-cancel:hover { background: #e9ecef; }

                .elp-btn-save {
                    background: #1B4332;
                    color: #fff;
                    border-radius: 8px;
                    padding: 9px 22px;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border: none;
                    cursor: pointer;
                }
                .elp-btn-save:hover:not(:disabled) { background: #14532d; }
                .elp-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

                .elp-coords {
                    font-size: 0.83rem;
                    color: #6c757d;
                }
                .elp-view-link {
                    background: none;
                    border: none;
                    color: #2f6fed;
                    font-weight: 600;
                    font-size: 0.85rem;
                    padding: 0;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .elp-view-link:hover { text-decoration: underline; }

                /* --- Toolbar: search bar takes the full space --- */
                .elp-table-toolbar {
                    margin-bottom: 20px;
                }
                .elp-search-wrap {
                    position: relative;
                    width: 100%;
                }
                .elp-search-input {
                    border-radius: 10px;
                    padding: 12px 16px 12px 42px;
                    border: 1px solid #dcdcdc;
                    width: 100%;
                    font-size: 0.95rem;
                }
                .elp-search-input:focus {
                    outline: none;
                    border-color: #1B4332;
                    box-shadow: 0 0 0 3px rgba(27,67,50,0.1);
                }
                .elp-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #adb5bd;
                    font-size: 1rem;
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
                .elp-table tbody tr.elp-main-row:hover { background: #f1f8f2; }
                .elp-table tbody tr.elp-main-row.expanded { background: #eaf4ec; }
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
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    position: relative;
                }
                .elp-empty-state {
                    text-align: center;
                    color: #adb5bd;
                    padding: 40px 0;
                    font-size: 0.95rem;
                }

                /* --- Delete chooser menu --- */
                .elp-delete-menu-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 1400;
                }
                .elp-delete-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 6px;
                    background: #fff;
                    border: 1px solid #eef0f2;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    z-index: 1500;
                    min-width: 170px;
                    overflow: hidden;
                }
                .elp-delete-menu-item {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 10px 14px;
                    background: #fff;
                    border: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #c0392b;
                    cursor: pointer;
                }
                .elp-delete-menu-item:hover:not(:disabled) { background: #fdeaea; }
                .elp-delete-menu-item:disabled { color: #ced4da; cursor: not-allowed; }

                /* --- Inline expand panel --- */
                .elp-expand-row td {
                    background: #f7faf7;
                    padding: 20px 24px !important;
                    border-top: none;
                }
                .elp-expand-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .elp-expand-section-label {
                    font-size: 0.78rem;
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
                    padding: 7px 12px;
                    font-size: 0.8rem;
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
                    font-size: 0.78rem;
                }
                .elp-expand-photo-preview {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #1B4332;
                    cursor: pointer;
                }
                .elp-expand-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 18px;
                    border-top: 1px solid #e2e8e3;
                    padding-top: 14px;
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

                /* --- Toast --- */
                .elp-toast-wrap {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 3000;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .elp-toast {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 18px;
                    border-radius: 10px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    animation: elp-toast-in 0.2s ease-out;
                    min-width: 240px;
                }
                .elp-toast-success { background: #e8f5e9; color: #1B4332; border: 1px solid #a5d6a7; }
                .elp-toast-error { background: #fdeaea; color: #c0392b; border: 1px solid #f5b5b5; }
                .elp-toast-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 700;
                    opacity: 0.7;
                    color: inherit;
                }
                @keyframes elp-toast-in {
                    from { opacity: 0; transform: translateX(16px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @media (max-width: 768px) {
                    .elp-expand-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 576px) {
                    .elp-card { padding: 18px; border-radius: 12px; }
                    .elp-btn { min-width: 0; }
                    .elp-photo-modal-close { top: -14px; right: 0; }
                    .elp-toast-wrap { left: 12px; right: 12px; top: 12px; }
                    .elp-toast { min-width: 0; }
                }
            `}</style>

            {toast && (
                <div className="elp-toast-wrap">
                    <div className={`elp-toast ${toast.type === "success" ? "elp-toast-success" : "elp-toast-error"}`}>
                        <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
                        <span>{toast.message}</span>
                        <button className="elp-toast-close" onClick={() => setToast(null)}>✕</button>
                    </div>
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            <div className="container-fluid mt-3 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h2 className="mb-0">User Location &amp; Photo</h2>
                    <button className="btn btn-danger" onClick={() => navigate("/employee")}>Back</button>
                </div>

                {loading ? <Loader /> : (
                    <div className="elp-card">
                        <div className="elp-table-toolbar">
                            <div className="elp-search-wrap">
                                <span className="elp-search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="elp-search-input"
                                    placeholder={`Search ${employees.length} users...`}
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
                                            <th>Photo</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((emp: any) => {
                                            const id = getEmpId(emp);
                                            const photo = getEmpPhoto(emp);
                                            const empHasLoc = hasLoc(emp);
                                            const empHasPhoto = !!photo;
                                            const isExpanded = expandedId === id;
                                            const isDeleteMenuOpen = deleteMenuId === id;
                                            return (
                                                <React.Fragment key={id}>
                                                    <tr className={`elp-main-row${isExpanded ? " expanded" : ""}`}>
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
                                                            {empHasPhoto ? (
                                                                <button className="elp-view-link" onClick={() => openViewPhoto(emp)}>
                                                                    🖼 View Photo
                                                                </button>
                                                            ) : (
                                                                <span className="elp-muted-text">Not set</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="elp-actions-cell">
                                                                {/* Direction shows first */}
                                                                {empHasLoc && (
                                                                    <button
                                                                        className="elp-btn elp-btn-direction"
                                                                        onClick={() => handleListDirection(emp)}
                                                                        disabled={listDirLoadingId === id}
                                                                    >
                                                                        {listDirLoadingId === id ? "Opening..." : "🗺 Direction"}
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="elp-btn elp-btn-location"
                                                                    onClick={() => toggleRow(emp)}
                                                                >
                                                                    📍 {empHasLoc ? "Update Location" : "Set Location"}
                                                                </button>

                                                                <button
                                                                    className="elp-btn elp-btn-photo"
                                                                    onClick={() => toggleRow(emp)}
                                                                >
                                                                    📷 {empHasPhoto ? "Update Photo" : "Set Photo"}
                                                                </button>

                                                                <button
                                                                    className="elp-btn elp-btn-del"
                                                                    onClick={() => toggleDeleteMenu(id)}
                                                                    disabled={!empHasLoc && !empHasPhoto}
                                                                >
                                                                    🗑 Delete
                                                                </button>

                                                                {isDeleteMenuOpen && (
                                                                    <>
                                                                        <div
                                                                            className="elp-delete-menu-backdrop"
                                                                            onClick={() => setDeleteMenuId(null)}
                                                                        />
                                                                        <div className="elp-delete-menu">
                                                                            <button
                                                                                className="elp-delete-menu-item"
                                                                                disabled={!empHasLoc}
                                                                                onClick={() => chooseDelete(emp, "location")}
                                                                            >
                                                                                📍 Delete Location
                                                                            </button>
                                                                            <button
                                                                                className="elp-delete-menu-item"
                                                                                disabled={!empHasPhoto}
                                                                                onClick={() => chooseDelete(emp, "photo")}
                                                                            >
                                                                                📷 Delete Photo
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {isExpanded && (
                                                        <tr className="elp-expand-row">
                                                            <td colSpan={4}>
                                                                <div className="elp-expand-grid">
                                                                    {/* Location column */}
                                                                    <div>
                                                                        <div className="elp-expand-section-label">Location</div>
                                                                        {expandedHasLocation ? (
                                                                            <div className="elp-coords mb-2">
                                                                                📍 {getEmpLat(expandedEmployee).toFixed(5)}, {getEmpLng(expandedEmployee).toFixed(5)}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="elp-muted-text mb-2">No location set yet</div>
                                                                        )}

                                                                        <button
                                                                            className="elp-btn elp-btn-location"
                                                                            onClick={handleStageLocation}
                                                                            disabled={fetchingLocation}
                                                                        >
                                                                            {fetchingLocation ? "Fetching..." : expandedHasLocation ? "📍 Update Location" : "📍 Get Current Location"}
                                                                        </button>

                                                                        {pendingLat !== null && pendingLng !== null && (
                                                                            <div className="elp-pending-note">
                                                                                <span>New location ready: {pendingLat.toFixed(5)}, {pendingLng.toFixed(5)}</span>
                                                                                <button
                                                                                    className="elp-pending-discard"
                                                                                    onClick={() => { setPendingLat(null); setPendingLng(null); }}
                                                                                >Discard</button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Photo column */}
                                                                    <div>
                                                                        <div className="elp-expand-section-label">Photo</div>
                                                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                                                            {pendingPhotoPreview ? (
                                                                                <img src={pendingPhotoPreview} alt="preview" className="elp-expand-photo-preview" />
                                                                            ) : expandedHasPhoto ? (
                                                                                <img
                                                                                    src={photo}
                                                                                    alt="user"
                                                                                    className="elp-expand-photo-preview"
                                                                                    onClick={() => openViewPhoto(expandedEmployee)}
                                                                                />
                                                                            ) : (
                                                                                <div className="elp-muted-text">No photo yet</div>
                                                                            )}

                                                                            <button className="elp-btn elp-btn-photo" onClick={handleChoosePhoto}>
                                                                                📷 Choose New Photo
                                                                            </button>
                                                                        </div>

                                                                        {pendingPhotoFile && (
                                                                            <div className="elp-pending-note">
                                                                                <span>New photo ready to save</span>
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
                                                                </div>

                                                                <div className="elp-expand-footer">
                                                                    <button className="elp-btn elp-btn-cancel" onClick={closeRow}>
                                                                        Cancel
                                                                    </button>
                                                                    <button className="elp-btn-save" onClick={handleSave} disabled={isSaveDisabled}>
                                                                        {saving ? "Saving..." : "💾 Save"}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

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