import React, { useState, useEffect } from "react";
import RoleService from "../Services/RoleService";
import type { Role as RoleType } from "../Services/RoleService";
import ConfirmModal from "../Components/layout/ConfirmModal";
import { useNavigate } from "react-router-dom";

const Role: React.FC = () => {
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleType | null>(null);
    const [formData, setFormData] = useState<RoleType>({ roleName: "" });
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const navigate = useNavigate()

    useEffect(() => {
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await RoleService.getAll();
            const data: any = res.data;
            const rolesArray = Array.isArray(data) ? data : data?.$values ?? data?.data ?? [];
            setRoles(rolesArray);
        } catch (err) {
            console.error(err);
            setError("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingRole(null);
        setFormData({ roleName: "" });
        setShowModal(true);
    };

    const openEditModal = (role: any) => {
        setEditingRole(role);
        setFormData({
            roleID: role.roleID,
            roleName: role.roleName,
        });
        setShowModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole && (editingRole as any).roleID) {
                await RoleService.update((editingRole as any).roleID, formData);
            } else {
                await RoleService.create(formData);
            }
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            console.error(err);
            setError("Failed to save role");
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await RoleService.delete(deleteId);
            fetchRoles();
        } catch (err) {
            console.error(err);
            setError("Failed to delete role");
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Role Management</h2>

            <div>
                <button
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/dashboard")}
                >
                    Cancel
                </button>

                <button
                    className="btn btn-primary"
                    onClick={openAddModal}
                >
                    + Add Role
                </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center">
                                    No roles found
                                </td>
                            </tr>
                        ) : (
                                    roles.map((role: any) => (
                                            <tr key ={role.roleID}>
                                            <td>{role.roleName ?? role.RoleName}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-warning me-2"
                                                    onClick={() => openEditModal(role)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => confirmDelete(role.roleID)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Add/Edit Modal */}
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
                                            <label className="form-label">Role Name</label>
                                            <input
                                                type="text"
                                                name="roleName"
                                                className="form-control"
                                                value={formData.roleName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="modal-footer border-0 justify-content-center pb-4 px-0">
                                            <button
                                                type="button"
                                                className="btn btn-secondary rounded-pill px-4"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary rounded-pill px-4">
                                                Save
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
                    confirmText="Delete"
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
};

export default Role;