/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getEmployees, updateEmployee, changePassword } from "../Services/EmployeeService";
import { getLocations } from "../Services/LocationService";
import { uploadProfilePhoto, getProfilePhotoUrl } from "../Services/ProfilePhotoService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import "./MyProfile.css";

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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [locationID, setLocationID] = useState(0);

    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

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
            const arr = Array.isArray(data) ? data : data?.$values ?? data?.data ?? [];
            const myProfile = arr.find((emp: any) => (emp.id ?? emp.ID ?? emp.Id) === userId);
            setEmployee(myProfile ?? null);

            try {
                const photoUrl = await getProfilePhotoUrl();
                setPhotoPreview(photoUrl);
            } catch {
                setPhotoPreview(null);
            }

        } catch {
            setError("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const loadLocations = async () => {
        try {
            const data: any = await getLocations();
            const arr = Array.isArray(data) ? data : data?.$values ?? data?.data ?? [];
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
        setShowChangeModal(true);
    };

    const closeChangeModal = () => setShowChangeModal(false);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // udane local preview kaatu
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);

        setPhotoUploading(true);
        try {
            const result = await uploadProfilePhoto(file);
            setPhotoPreview(result.url); // Azure URL
            setSuccessMessage("Profile photo updated!");
        } catch {
            setError("Failed to upload photo. Please try again.");
        } finally {
            setPhotoUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateEmployee(userId, {
                firstName,
                lastName,
                emailId,
                locationID,
                mobile: employee.mobile ?? employee.Mobile,
                roleID: employee.roleID ?? employee.RoleID,
            });
            setSuccessMessage("Profile updated successfully!");
            setShowChangeModal(false);
            await loadProfile();
        } catch (err: any) {
            setShowChangeModal(false);
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (!oldPassword.trim()) { setError("Please enter your current password."); return; }
        if (!password.trim()) { setError("Please enter a new password."); return; }
        if (oldPassword.trim() === password.trim()) { setError("New password must be different from current password."); return; }

        setSavingPassword(true);
        try {
            await changePassword(
                userId,
                String(employee.mobile ?? employee.Mobile ?? ""),
                oldPassword.trim(),
                password.trim()
            );
            setSuccessMessage("Password updated successfully!");
            setOldPassword(""); setPassword("");
            setShowOldPassword(false); setShowPassword(false);
            setShowPasswordModal(false);
        } catch (err: any) {
            setShowPasswordModal(false);
            const msg = err?.response?.data?.message ?? err?.response?.data ?? "Failed to update password.";
            setError(typeof msg === "string" ? msg : "Incorrect current password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const getInitial = () => {
        const name = employee?.firstName ?? employee?.FirstName ?? "?";
        return name[0].toUpperCase();
    };

    const fullName = `${employee?.firstName ?? employee?.FirstName ?? ""} ${employee?.lastName ?? employee?.LastName ?? ""}`.trim();

    const EyeOpen = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    const EyeOff = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    const Spinner = () => (
        <span style={{
            width: 13, height: 13,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite"
        }} />
    );

    return (
        <>
            <div className="profile-page">
                <ErrorModal message={error} onClose={() => setError("")} />
                <SuccessModal message={successMessage} onClose={() => setSuccessMessage("")} />

                {loading ? (
                    <Loader text="Loading Profile..." />
                ) : !employee ? (
                    <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}>
                        Profile not found.
                    </div>
                ) : (
                    <div className="profile-card">

                        {/* LEFT PANEL */}
                        <div className="profile-left">
                            <div className="avatar-wrap">
                                <div className="avatar-ring">
                                    <div className="avatar-inner">
                                        {photoUploading ? (
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "100%",
                                                background: "rgba(0,0,0,0.3)",
                                                borderRadius: "50%",
                                            }}>
                                                <span style={{
                                                    width: 28, height: 28,
                                                    border: "3px solid rgba(255,255,255,0.3)",
                                                    borderTopColor: "#fff",
                                                    borderRadius: "50%",
                                                    display: "inline-block",
                                                    animation: "spin 0.7s linear infinite"
                                                }} />
                                            </div>
                                        ) : photoPreview ? (
                                            <img src={photoPreview} alt="Profile" />
                                        ) : (
                                            getInitial()
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="avatar-edit-btn"
                                    onClick={() => !photoUploading && fileInputRef.current?.click()}
                                    title="Change photo"
                                    style={{ cursor: photoUploading ? "not-allowed" : "pointer", opacity: photoUploading ? 0.5 : 1 }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

                            <div className="profile-name">{fullName || "—"}</div>
                            <div className="left-divider" />

                            <div className="left-stat">
                                <div className="left-stat-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 3.18 2 2 0 014.11 1h2.08a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="left-stat-label">Mobile</div>
                                    <div className="left-stat-value">{employee.mobile ?? employee.Mobile ?? "—"}</div>
                                </div>
                            </div>

                            <div className="left-stat">
                                <div className="left-stat-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="left-stat-label">Location</div>
                                    <div className="left-stat-value">{employee.locationName ?? "—"}</div>
                                </div>
                            </div>

                            <div className="left-stat">
                                <div className="left-stat-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="left-stat-label">Email</div>
                                    <div className="left-stat-value" style={{ fontSize: "0.75rem" }}>
                                        {employee.emailId ?? employee.EmailId ?? "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="left-bottom">
                                <div className="left-bottom-divider" />
                                <button
                                    className="btn-change-password"
                                    onClick={() => {
                                        setOldPassword(""); setPassword("");
                                        setShowOldPassword(false); setShowPassword(false);
                                        setShowPasswordModal(true);
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="profile-right">
                            <div className="section-eyebrow">Account Overview</div>
                            <div className="section-title">Profile Details</div>
                            <div className="section-sub">Your personal information & contact details</div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        First Name
                                    </div>
                                    <div className="info-item-value">{employee.firstName ?? employee.FirstName ?? "—"}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Last Name
                                    </div>
                                    <div className="info-item-value">{employee.lastName ?? employee.LastName ?? "—"}</div>
                                </div>

                                <div className="info-item full-width">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        Email Address
                                    </div>
                                    <div className="info-item-value">{employee.emailId ?? employee.EmailId ?? "—"}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Location
                                    </div>
                                    <div className="info-item-value">{employee.locationName ?? "—"}</div>
                                </div>
                            </div>

                            <div className="action-row">
                                <button className="btn-back" onClick={() => navigate("/dashboard")}>
                                    Back to Dashboard
                                </button>
                                <button className="btn-edit" onClick={openChangeModal}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {showChangeModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeChangeModal(); }}>
                        <div className="modal-box">
                            <div className="modal-top-bar">
                                <div className="modal-top-title">
                                    Edit Profile <span className="modal-badge">Personal Info</span>
                                </div>
                                <button className="modal-close-btn" onClick={closeChangeModal}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-row">
                                    <div className="field-group">
                                        <label className="field-label">First Name</label>
                                        <input className="field-input" type="text" value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Last Name</label>
                                        <input className="field-input" type="text" value={lastName}
                                            onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-row">
                                    <div className="field-group">
                                        <label className="field-label">Location</label>
                                        <select className="field-input" value={locationID}
                                            onChange={(e) => setLocationID(Number(e.target.value))}>
                                            <option value={0}>-- Select --</option>
                                            {locations.map((loc: any) => {
                                                const id = loc.locationID ?? loc.LocationID;
                                                const name = loc.locationName ?? loc.LocationName;
                                                return <option key={id} value={id}>{name}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label className="field-label">Email Address</label>
                                    <input className="field-input" type="email" value={emailId}
                                        onChange={(e) => setEmailId(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn-cancel" onClick={closeChangeModal} disabled={saving}>
                                    Cancel
                                </button>
                                <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <><Spinner /> Saving...</>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
                        <div className="modal-box">
                            <div className="modal-top-bar">
                                <div className="modal-top-title">
                                    Change Password <span className="modal-badge">Security</span>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="field-group">
                                    <label className="field-label">Current Password</label>
                                    <div className="password-wrap">
                                        <input
                                            className="field-input"
                                            type={showOldPassword ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Enter current password"
                                        />
                                        <button className="eye-btn" onClick={() => setShowOldPassword(!showOldPassword)} type="button">
                                            {showOldPassword ? <EyeOff /> : <EyeOpen />}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label className="field-label">New Password</label>
                                    <div className="password-wrap">
                                        <input
                                            className="field-input"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} type="button">
                                            {showPassword ? <EyeOff /> : <EyeOpen />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="modal-btn-cancel"
                                    onClick={() => {
                                        setOldPassword(""); setPassword("");
                                        setShowOldPassword(false); setShowPassword(false);
                                        setShowPasswordModal(false);
                                    }}
                                    disabled={savingPassword}
                                >
                                    Cancel
                                </button>
                                <button className="modal-btn-save" onClick={handleSavePassword} disabled={savingPassword}>
                                    {savingPassword ? (
                                        <><Spinner /> Updating...</>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default MyProfile;