/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getEmployees, updateEmployee, changePassword } from "../Services/EmployeeService";
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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
        if (!oldPassword.trim()) {
            setError("Please enter your current password.");
            return;
        }
        if (!password.trim()) {
            setError("Please enter a new password.");
            return;
        }
        if (oldPassword.trim() === password.trim()) {
            setError("New password must be different from current password.");
            return;
        }

        setSavingPassword(true);
        try {
            await changePassword(
                userId,
                String(employee.mobile ?? employee.Mobile ?? ""),
                oldPassword.trim(),
                password.trim()
            );
            setSuccessMessage("Password updated successfully!");
            setOldPassword("");
            setPassword("");
            setShowOldPassword(false);
            setShowPassword(false);
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

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                .profile-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0a1628 0%, #1B4332 50%, #0d2818 100%);
                    display: flex; align-items: center; justify-content: center;
                    padding: 2rem 1rem; font-family: 'Inter', sans-serif;
                    position: relative; overflow: hidden;
                }
                .profile-page::before {
                    content: ''; position: absolute;
                    width: 500px; height: 500px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(27,67,50,0.4) 0%, transparent 70%);
                    top: -150px; right: -100px; pointer-events: none;
                }
                .profile-page::after {
                    content: ''; position: absolute;
                    width: 400px; height: 400px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(13,40,24,0.5) 0%, transparent 70%);
                    bottom: -100px; left: -100px; pointer-events: none;
                }
                .profile-card {
                    width: 100%; max-width: 820px;
                    background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
                    overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.5);
                    display: grid; grid-template-columns: 280px 1fr;
                    min-height: 520px; position: relative; z-index: 1;
                }
                .profile-left {
                    background: linear-gradient(180deg, rgba(27,67,50,0.6) 0%, rgba(10,22,40,0.8) 100%);
                    padding: 2.5rem 2rem; display: flex; flex-direction: column;
                    align-items: center; border-right: 1px solid rgba(255,255,255,0.08);
                }
                .avatar-wrap { position: relative; margin-bottom: 1.25rem; }
                .avatar-ring {
                    width: 100px; height: 100px; border-radius: 50%;
                    background: linear-gradient(135deg, #52b788, #1B4332);
                    padding: 3px; box-shadow: 0 0 0 4px rgba(82,183,136,0.15);
                }
                .avatar-inner {
                    width: 100%; height: 100%; border-radius: 50%; background: #0d2818;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.2rem; font-weight: 700; color: #52b788; overflow: hidden;
                }
                .avatar-inner img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
                .avatar-edit-btn {
                    position: absolute; bottom: 2px; right: 2px;
                    width: 30px; height: 30px; border-radius: 50%;
                    background: #52b788; border: 2px solid #0a1628;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s; color: #fff;
                }
                .avatar-edit-btn:hover { background: #40916c; transform: scale(1.1); }
                .profile-name {
                    font-size: 1.1rem; font-weight: 700; color: #fff;
                    text-align: center; margin-bottom: 1.5rem; letter-spacing: -0.01em;
                }
                .left-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 1.25rem; }
                .left-stat { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; }
                .left-stat-icon {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: rgba(82,183,136,0.1); border: 1px solid rgba(82,183,136,0.15);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; color: #52b788;
                }
                .left-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.35); line-height: 1; margin-bottom: 2px; }
                .left-stat-value { font-size: 0.82rem; color: rgba(255,255,255,0.8); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
                .profile-right { padding: 2.5rem; display: flex; flex-direction: column; }
                .section-eyebrow { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #52b788; margin-bottom: 0.5rem; }
                .section-title { font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
                .section-sub { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-bottom: 2rem; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
                .info-item {
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 14px; padding: 1rem 1.25rem; transition: border-color 0.2s;
                }
                .info-item:hover { border-color: rgba(82,183,136,0.25); }
                .info-item.full-width { grid-column: 1 / -1; }
                .info-item-label {
                    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em;
                    text-transform: uppercase; color: rgba(255,255,255,0.3);
                    margin-bottom: 0.4rem; display: flex; align-items: center; gap: 5px;
                }
                .info-item-value { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.88); }
                .action-row { display: flex; gap: 0.75rem; margin-top: 2rem; justify-content: flex-end; }
                .btn-back {
                    padding: 0.6rem 1.5rem; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.15); background: transparent;
                    color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 500;
                    cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
                }
                .btn-back:hover { border-color: rgba(255,255,255,0.3); color: #fff; background: rgba(255,255,255,0.05); }
                .btn-edit {
                    padding: 0.6rem 1.75rem; border-radius: 12px; border: none;
                    background: linear-gradient(135deg, #52b788, #1B4332);
                    color: #fff; font-size: 0.85rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; gap: 6px;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 4px 16px rgba(82,183,136,0.25);
                }
                .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(82,183,136,0.35); }
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                    padding: 1rem; animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .modal-box {
                    background: #0f2419; border: 1px solid rgba(82,183,136,0.2);
                    border-radius: 20px; width: 100%; max-width: 460px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
                    overflow: hidden; animation: slideUp 0.25s ease;
                    font-family: 'Inter', sans-serif;
                }
                .modal-top-bar {
                    background: linear-gradient(90deg, rgba(27,67,50,0.8), rgba(82,183,136,0.1));
                    padding: 1.25rem 1.5rem;
                    display: flex; align-items: center; justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .modal-top-title { font-size: 1rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
                .modal-badge {
                    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
                    text-transform: uppercase; color: #52b788;
                    background: rgba(82,183,136,0.12); border: 1px solid rgba(82,183,136,0.2);
                    padding: 2px 8px; border-radius: 6px;
                }
                .modal-close-btn {
                    width: 30px; height: 30px; border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.5);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .modal-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .field-group { display: flex; flex-direction: column; gap: 6px; }
                .field-label {
                    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
                    text-transform: uppercase; color: rgba(255,255,255,0.4);
                }
                .field-input {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; padding: 0.6rem 0.9rem; color: #fff;
                    font-size: 0.85rem; font-family: 'Inter', sans-serif; outline: none;
                    transition: border-color 0.2s; width: 100%; box-sizing: border-box;
                }
                .field-input:focus { border-color: rgba(82,183,136,0.5); background: rgba(82,183,136,0.04); }
                input.field-input:read-only { opacity: 0.4; cursor: not-allowed; }
                .field-input option { background: #0f2419; color: #fff; }
                .modal-footer {
                    padding: 1rem 1.5rem 1.5rem;
                    display: flex; gap: 0.75rem; justify-content: flex-end;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .modal-btn-cancel {
                    padding: 0.6rem 1.4rem; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.12); background: transparent;
                    color: rgba(255,255,255,0.55); font-size: 0.83rem; font-weight: 500;
                    cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
                }
                .modal-btn-cancel:hover:not(:disabled) { border-color: rgba(255,255,255,0.25); color: #fff; }
                .modal-btn-save {
                    padding: 0.6rem 1.6rem; border-radius: 10px; border: none;
                    background: linear-gradient(135deg, #52b788, #1B4332);
                    color: #fff; font-size: 0.83rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; gap: 6px;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 4px 14px rgba(82,183,136,0.25);
                }
                .modal-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(82,183,136,0.35); }
                .modal-btn-save:disabled, .modal-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .eye-btn {
                    position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; color: rgba(255,255,255,0.35);
                    cursor: pointer; padding: 0; display: flex; align-items: center;
                }
                @media (max-width: 640px) {
                    .profile-card { grid-template-columns: 1fr; }
                    .profile-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
                    .info-grid { grid-template-columns: 1fr; }
                    .modal-row { grid-template-columns: 1fr; }
                }
            `}</style>

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
                                        {photoPreview ? <img src={photoPreview} alt="Profile" /> : getInitial()}
                                    </div>
                                </div>
                                <div className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()} title="Change photo">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

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
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
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
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="left-stat-label">Email</div>
                                    <div className="left-stat-value" style={{ fontSize: "0.75rem" }}>{employee.emailId ?? employee.EmailId ?? "—"}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: "auto", width: "100%", paddingTop: "1.5rem" }}>
                                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "1.25rem" }} />
                                <button
                                    onClick={() => {
                                        setOldPassword("");
                                        setPassword("");
                                        setShowOldPassword(false);
                                        setShowPassword(false);
                                        setShowPasswordModal(true);
                                    }}
                                    style={{
                                        width: "100%", padding: "0.62rem", borderRadius: 10, border: "none",
                                        background: "linear-gradient(135deg, #52b788, #1B4332)",
                                        color: "#fff", fontSize: "0.83rem", fontWeight: 600,
                                        cursor: "pointer", display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: 6, fontFamily: "Inter, sans-serif",
                                        boxShadow: "0 4px 14px rgba(82,183,136,0.25)", transition: "all 0.2s"
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
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        First Name
                                    </div>
                                    <div className="info-item-value">{employee.firstName ?? employee.FirstName ?? "—"}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        Last Name
                                    </div>
                                    <div className="info-item-value">{employee.lastName ?? employee.LastName ?? "—"}</div>
                                </div>
                                <div className="info-item full-width">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                        Email Address
                                    </div>
                                    <div className="info-item-value">{employee.emailId ?? employee.EmailId ?? "—"}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 3.18 2 2 0 014.11 1h2.08a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                        Mobile
                                    </div>
                                    <div className="info-item-value">{employee.mobile ?? employee.Mobile ?? "—"}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-item-label">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
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
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT PROFILE MODAL */}
                {showChangeModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeChangeModal(); }}>
                        <div className="modal-box">
                            <div className="modal-top-bar">
                                <div className="modal-top-title">
                                    Edit Profile <span className="modal-badge">Personal Info</span>
                                </div>
                                <button className="modal-close-btn" onClick={closeChangeModal}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-row">
                                    <div className="field-group">
                                        <label className="field-label">First Name</label>
                                        <input className="field-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Last Name</label>
                                        <input className="field-input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-row">
                                    <div className="field-group">
                                        <label className="field-label">Mobile</label>
                                        <input className="field-input" type="text" value={employee.mobile ?? employee.Mobile ?? ""} readOnly />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Location</label>
                                        <select className="field-input" value={locationID} onChange={(e) => setLocationID(Number(e.target.value))}>
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
                                    <input className="field-input" type="email" value={emailId} onChange={(e) => setEmailId(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn-cancel" onClick={closeChangeModal} disabled={saving}>Cancel</button>
                                <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CHANGE PASSWORD MODAL */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
                        <div className="modal-box">
                            <div className="modal-top-bar">
                                <div className="modal-top-title">
                                    Change Password <span className="modal-badge">Security</span>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">

                                {/* Current Password */}
                                <div className="field-group">
                                    <label className="field-label">Current Password</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            className="field-input"
                                            type={showOldPassword ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            style={{ paddingRight: "2.4rem" }}
                                        />
                                        <button className="eye-btn" onClick={() => setShowOldPassword(!showOldPassword)} type="button">
                                            {showOldPassword ? <EyeOff /> : <EyeOpen />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="field-group">
                                    <label className="field-label">New Password</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            className="field-input"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            style={{ paddingRight: "2.4rem" }}
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
                                        setOldPassword("");
                                        setPassword("");
                                        setShowOldPassword(false);
                                        setShowPassword(false);
                                        setShowPasswordModal(false);
                                    }}
                                    disabled={savingPassword}
                                >
                                    Cancel
                                </button>
                                <button className="modal-btn-save" onClick={handleSavePassword} disabled={savingPassword}>
                                    {savingPassword ? (
                                        <>
                                            <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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