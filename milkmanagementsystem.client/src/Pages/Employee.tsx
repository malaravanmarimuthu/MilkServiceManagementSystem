/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
} from "../Services/EmployeeService";
import { getLocations } from "../Services/LocationService";
import type { LocationType } from "../Services/LocationService";
import ConfirmModal from "../Components/Common/ConfirmModal";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import Pagination from "../Components/Common/Pagination";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const emptyForm = {
    firstName: "",
    lastName: "",
    emailId: "",
    mobile: "",
    password: "",
    locationID: 0,
    roleID: 1,
};

const Employee: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [formData, setFormData] = useState(emptyForm);
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
        fetchEmployees();
        fetchLocations();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            const data: any = res.data;
            const arr = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];

            console.log(res.data);
            setEmployees([...arr].reverse());
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const data = await getLocations();
            const arr = Array.isArray(data)
                ? data
                : (data as any)?.$values ?? (data as any)?.data ?? [];
            setLocations(arr);
        } catch (err) {
            console.error(err);
        }
    };

    const getLocationName = (locationID: number) => {
        const loc = locations.find(
            (l) => (l.locationID ?? (l as any).LocationID) === locationID
        );
        return loc
            ? loc.locationName ?? (loc as any).LocationName
            : locationID;
    };

    const filteredEmployees = employees.filter((e: any) => {
        const full =
            `${e.firstName ?? e.FirstName ?? ""} ${e.lastName ?? e.LastName ?? ""} ${e.emailId ?? e.EmailId ?? ""} ${e.mobile ?? e.Mobile ?? ""}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openAddModal = () => {
        setEditingEmployee(null);
        setFormData(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (emp: any) => {
        setEditingEmployee(emp);
        setFormData({
            firstName: emp.firstName ?? emp.FirstName ?? "",
            lastName: emp.lastName ?? emp.LastName ?? "",
            emailId: emp.emailId ?? emp.EmailId ?? "",
            mobile: emp.mobile ?? emp.Mobile ?? "",
            password: "",
            locationID: emp.locationID ?? emp.LocationID ?? 0,
            roleID: emp.roleID ?? emp.RoleID ?? 1,
        });
        setFormError("");
        setShowModal(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormError("");
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]:
                name === "locationID" || name === "roleID"
                    ? Number(value)
                    : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        if (formData.locationID === 0) {
            setFormError("Please select a location.");
            return;
        }

        setSaving(true);
        try {
            if (editingEmployee) {
                const id =
                    editingEmployee.id ??
                    editingEmployee.ID ??
                    editingEmployee.Id;
                await updateEmployee(id, formData);
                setSuccessMessage("Employee updated successfully!");
            } else {
                await addEmployee(formData);
                setSuccessMessage("Employee created successfully!");
            }
            setShowModal(false);
            fetchEmployees();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data ??
                "Failed to save employee";
            setError(typeof msg === "string" ? msg : "Failed to save employee");
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
            await deleteEmployee(deleteId);
            setSuccessMessage("Employee deleted successfully!");
            fetchEmployees();
        } catch (err) {
            console.error(err);
            setError("Failed to delete employee");
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Employee Management</h2>
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
                             Add Employee
                        </button>
                    </div>
                </div>

                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ maxWidth: "300px" }}
                    />
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Location</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center">
                                            No employees found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEmployees.map(
                                        (emp: any, index: number) => {
                                            const id =
                                                emp.id ??
                                                emp.ID ??
                                                emp.Id ??
                                                index;
                                            return (
                                                <tr key={`emp-${id}-${index}`}>
                                                    <td>{emp.firstName ?? emp.FirstName}</td>
                                                    <td>{emp.lastName ?? emp.LastName}</td>
                                                    <td>{emp.emailId ?? emp.EmailId}</td>
                                                    <td>{emp.mobile ?? emp.Mobile}</td>
                                                    <td>{emp.locationName}</td>
                                                    <td>{emp.roleName}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-warning me-2"
                                                            onClick={() => openEditModal(emp)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => confirmDelete(id)}
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
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        )}
                    </>
                )}
            </div>

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
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 px-4 pt-4 pb-0">
                                    <h5 className="modal-title fw-bold">
                                        {editingEmployee ? "Edit Employee" : "Add Employee"}
                                    </h5>
                                </div>
                                <div className="modal-body px-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    className="form-control"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    className="form-control"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Mobile</label>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    className="form-control"
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    name="emailId"
                                                    className="form-control"
                                                    value={formData.emailId}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {!editingEmployee && (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Password</label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        className="form-control"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            )}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Location</label>
                                                <select
                                                    name="locationID"
                                                    className="form-select"
                                                    value={formData.locationID}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value={0} disabled>
                                                        -- Select Location --
                                                    </option>
                                                    {locations.map((loc) => {
                                                        const locId = loc.locationID ?? (loc as any).LocationID;
                                                        const locName = loc.locationName ?? (loc as any).LocationName;
                                                        return (
                                                            <option key={locId} value={locId}>
                                                                {locName}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        {formError && (
                                            <div className="text-danger mb-2">{formError}</div>
                                        )}

                                        <div className="modal-footer border-0 justify-content-center pb-4 px-0">
                                            <button
                                                type="button"
                                                className="btn btn-secondary rounded-pill px-4"
                                                onClick={() => setShowModal(false)}
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
                                                        {editingEmployee ? "Updating..." : "Saving..."}
                                                    </>
                                                ) : editingEmployee ? (
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

            {showConfirm && (
                <ConfirmModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this employee?"
                    confirmText={deleting ? "Deleting..." : "Delete"}
                    isLoading={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default Employee;