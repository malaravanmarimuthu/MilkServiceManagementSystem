/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getEmployees, updateEmployee } from "../Services/EmployeeService";
import { getLocations } from "../Services/LocationService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";

interface JwtPayload {
    userid: string;
    firstname: string;
    rolename: string;
}

function MyProfile() {
    const navigate = useNavigate();

    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [locationID, setLocationID] = useState(0);
    const [password, setPassword] = useState("");

    const token = localStorage.getItem("token");
    let userId = 0;
    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        userId = Number(decoded.userid);
    }

    useEffect(() => {
        loadProfile();
        loadLocations();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res: any = await getEmployees();
            const data = res.data;
            const arr = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];

            const myProfile = arr.find((emp: any) =>
                (emp.id ?? emp.ID ?? emp.Id) === userId
            );
            setEmployee(myProfile ?? null);

            const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
            if (savedPhoto) setPhotoPreview(savedPhoto);
        } catch {
            setError("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const loadLocations = async () => {
        try {
            const data: any = await getLocations();
            const arr = Array.isArray(data)
                ? data
                : data?.$values ?? data?.data ?? [];
            setLocations(arr);
        } catch {
            setLocations([]);
        }
    };

    const openChangeModal = () => {
        if (!employee) return;
        setFirstName(employee.firstName ?? employee.FirstName ?? "");
        setLastName(employee.lastName ?? employee.LastName ?? "");
        setEmailId(employee.emailId ?? employee.EmailId ?? "");
        setLocationID(employee.locationID ?? employee.LocationID ?? 0);
        setPassword("");
        setShowChangeModal(true);
    };

    const closeChangeModal = () => {
        setShowChangeModal(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPhotoPreview(base64);
            localStorage.setItem(`profile_photo_${userId}`, base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateEmployee(userId, {
                firstName,
                lastName,
                emailId,
                locationID,
                password: password || undefined,
                mobile: employee.mobile ?? employee.Mobile,
                roleID: employee.roleID ?? employee.RoleID,
            });
            setSuccessMessage("Profile updated successfully!");
            setShowChangeModal(false);
            await loadProfile();
        } catch (err: any) {
            setShowChangeModal(false);
            setError(
                err?.response?.data?.message ??
                err?.response?.data ??
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const getInitial = () => {
        const name = employee?.firstName ?? employee?.FirstName ?? "?";
        return name[0].toUpperCase();
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={successMessage} onClose={() => setSuccessMessage("")} />

            <h3 className="mb-4 fw-bold">My Profile</h3>

            {loading ? (
                <Loader text="Loading Profile..." />
            ) : !employee ? (
                <div className="alert alert-info">Profile not found.</div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="text-center mb-4">
                        <div style={{ position: "relative", display: "inline-block" }}>

                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile"
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "3px solid #1B4332",
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "90px",
                                    height: "90px",
                                    borderRadius: "50%",
                                    background: "#1B4332",
                                    color: "#fff",
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                }}>
                                    {getInitial()}
                                </div>
                            )}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "#1B4332",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handlePhotoChange}
                        />

                        <h5 className="mt-3 mb-0 fw-bold">
                            {employee.firstName ?? employee.FirstName}{" "}
                            {employee.lastName ?? employee.LastName}
                        </h5>
                       
                    </div>

                    {/* Details */}
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="p-3 rounded-3" style={{ background: "#f8f9fa" }}>
                                <small className="text-muted">Mobile</small>
                                <div className="fw-semibold">
                                    {employee.mobile ?? employee.Mobile ?? "-"}
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-3 rounded-3" style={{ background: "#f8f9fa" }}>
                                <small className="text-muted">Email</small>
                                <div className="fw-semibold">
                                    {employee.emailId ?? employee.EmailId ?? "-"}
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-3 rounded-3" style={{ background: "#f8f9fa" }}>
                                <small className="text-muted">Location</small>
                                <div className="fw-semibold">
                                    {employee.locationName ?? "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancel & Change Buttons */}
                    <div className="text-center mt-4 d-flex justify-content-center gap-3">
                        <button
                            className="btn btn-danger rounded-pill px-5"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-5"
                            onClick={openChangeModal}
                        >
                            Change
                        </button>
                    </div>

                </div>
            )}

            {/* Change Modal */}
            {showChangeModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backdropFilter: "blur(4px)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                        }}
                        onClick={closeChangeModal}
                    />
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                                <div className="modal-header border-0 px-4 pt-4 pb-0">
                                    <h5 className="modal-title fw-bold">Edit Profile</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeChangeModal}
                                    />
                                </div>

                                <div className="modal-body px-4 py-3">

                                    <div className="mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={emailId}
                                            onChange={(e) => setEmailId(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mobile</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={employee.mobile ?? employee.Mobile ?? ""}
                                            readOnly
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Location</label>
                                        <select
                                            className="form-select"
                                            value={locationID}
                                            onChange={(e) => setLocationID(Number(e.target.value))}
                                        >
                                            <option value={0}>-- Select Location --</option>
                                            {locations.map((loc: any) => {
                                                const id = loc.locationID ?? loc.LocationID;
                                                const name = loc.locationName ?? loc.LocationName;
                                                return (
                                                    <option key={id} value={id}>{name}</option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            New Password{" "}
                                            <span className="text-muted small">(optional)</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>

                                </div>

                                <div className="modal-footer border-0 justify-content-center pb-4">
                                    <button
                                        className="btn btn-secondary rounded-pill px-4"
                                        onClick={closeChangeModal}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary rounded-pill px-4"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Saving...
                                            </>
                                        ) : "Save"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default MyProfile;