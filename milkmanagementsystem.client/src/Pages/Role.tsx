/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import RoleService from "../Services/RoleService";
import type { Role as RoleType } from "../Services/RoleService";
import ConfirmModal from "../Components/Common/ConfirmModal";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const Role: React.FC = () => {
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleType | null>(null);
    const [formData, setFormData] = useState<RoleType>({ roleName: "" });
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await RoleService.getAll();
            const data: any = res.data;
            const rolesArray = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];
            setRoles([...rolesArray].reverse()); // newest first
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    // Search only - no sort
    const filteredRoles = roles.filter((r: any) =>
        (r.roleName ?? r.RoleName ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
    const paginatedRoles = filteredRoles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openAddModal = () => {
        setEditingRole(null);
        setFormData({ roleName: "" });
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (role: any) => {
        setEditingRole(role);
        setFormData({
            roleID: role.roleID ?? role.RoleID,
            roleName: role.roleName ?? role.RoleName,
        });
        setFormError("");
        setShowModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormError("");
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        const isDuplicate = roles.some((r: any) => {
            const existingName = (r.roleName ?? r.RoleName ?? "").trim().toLowerCase();
            const newName = formData.roleName.trim().toLowerCase();
            const existingId = r.roleID ?? r.RoleID;
            const editingId =
                (editingRole as any)?.roleID ?? (editingRole as any)?.RoleID;
            return existingName === newName && existingId !== editingId;
        });

        if (isDuplicate) {
            setFormError("This role name already exists!");
            return;
        }

        if (
            editingRole &&
            formData.roleName.trim() ===
            (
                (editingRole as any).roleName ??
                (editingRole as any).RoleName ??
                ""
            ).trim()
        ) {
            setFormError(
                "No changes detected. Please modify the role before updating."
            );
            return;
        }

        setSaving(true);
        try {
            if (editingRole) {
                const id =
                    (editingRole as any).roleID ?? (editingRole as any).RoleID;
                await RoleService.update(id, {
                    roleID: id,
                    roleName: formData.roleName.trim(),
                });
                setSuccessMessage("Role updated successfully!");
            } else {
                await RoleService.create({
                    roleID: 0,
                    roleName: formData.roleName.trim(),
                });
                setSuccessMessage("Role created successfully!");
            }
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            setError("Failed to save role");
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
            await RoleService.delete(deleteId);
            setSuccessMessage("Role deleted successfully!");
            fetchRoles();
        } catch (err) {
            console.error(err);
            setError("Failed to delete role");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />

            <div className="container mt-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Role Management</h2>
                    <div>
                        <button
                            className="btn btn-danger me-2"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openAddModal}
                        >
                             Add Role
                        </button>
                    </div>
                </div>

                {/* Search only */}
                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search role..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ maxWidth: "300px" }}
                    />
                </div>

                {/* Loader OR Table */}
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Role Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRoles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="text-center"
                                        >
                                            No roles found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRoles.map(
                                        (role: any, index: number) => {
                                            const id =
                                                role.roleID ??
                                                role.RoleID ??
                                                index;
                                            return (
                                                <tr key={`role-${id}-${index}`}>
                                                    <td>
                                                        {role.roleName ??
                                                            role.RoleName}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-warning me-2"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    role
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() =>
                                                                confirmDelete(id)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Add / Edit Modal */}
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
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 px-4 pt-4 pb-0">
                                    <h5 className="modal-title fw-bold">
                                        {editingRole ? "Edit Role" : "Add Role"}
                                    </h5>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Role Name
                                            </label>
                                            <input
                                                type="text"
                                                name="roleName"
                                                className="form-control"
                                                value={formData.roleName}
                                                onChange={handleChange}
                                                required
                                            />
                                            {formError && (
                                                <div className="text-danger mt-2">
                                                    {formError}
                                                </div>
                                            )}
                                        </div>
                                        <div className="modal-footer border-0 justify-content-center pb-4 px-0">
                                            <button
                                                type="button"
                                                className="btn btn-secondary rounded-pill px-4"
                                                onClick={() =>
                                                    setShowModal(false)
                                                }
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
                                                        {editingRole
                                                            ? "Updating..."
                                                            : "Saving..."}
                                                    </>
                                                ) : editingRole ? (
                                                    "Update"
                                                ) : (
                                                    "Save"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Confirm Delete */}
            {showConfirm && (
                <ConfirmModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this role?"
                    confirmText={deleting ? "Deleting..." : "Delete"}
                    isLoading={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default Role;