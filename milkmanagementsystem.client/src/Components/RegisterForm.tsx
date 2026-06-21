/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";
import { validateRegisterForm } from "../Helpers/Validation";
import { RegisterErrors } from "../Helpers/Validation";
import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "./Common/ErrorModal";
import { getLocations } from "../Services/LocationService";

type Props = {
    setIsRegister: (value: boolean) => void;
};

export default function RegisterForm({ setIsRegister }: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [mobile, setMobile] = useState("");
    const [locationID, setLocationID] = useState(0);
    const [locations, setLocations] = useState<any[]>([]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const mobileRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchLocations(); }, []);

    const fetchLocations = async () => {
        try {
            const data = await getLocations();
            const arr = Array.isArray(data) ? data : [];

            arr.sort((a: any, b: any) => {
                if (a.loactionName === "Other") return 1;
                if (b.locationName === "Other") return -1;
                return 0;
            });
            setLocations(arr);

        } catch (err) { console.error(err); }
    };

    const handleRegister = async () => {
        const validationErrors = validateRegisterForm({
            firstName, lastName, emailId, mobile, password, confirmPassword,
            location: ""
        });
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            if (validationErrors.firstName) firstNameRef.current?.focus();
            else if (validationErrors.lastName) lastNameRef.current?.focus();
            else if (validationErrors.emailId) emailRef.current?.focus();
            else if (validationErrors.mobile) mobileRef.current?.focus();
            else if (validationErrors.password) passwordRef.current?.focus();
            else if (validationErrors.confirmPassword) confirmPasswordRef.current?.focus();
            return;
        }
        if (locationID === 0)
        {
            setErrors((prev: any) => ({ ...prev, location: "Please select a location" }));
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post(config.AUTH_URL + "/Auth/signup", {
                firstName, lastName, password, emailId, mobile, locationID,
            });
            setMessage("Registration Successful! Redirecting...");
            setFirstName(""); setLastName(""); setEmailId("");
            setMobile(""); setPassword(""); setConfirmPassword(""); setLocationID(0);
            setTimeout(() => setIsRegister(false), 1800);
        } catch (err) {
            setErrorMsg(handleApiError(err));
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                /* ── PAGE BACKGROUND ── */
                .reg-page {
    min-height: 100vh;
    width: 100vw;          
    margin: 0;             
    padding: 30px 16px;
    position: fixed;       
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    background-size: 400% 400%;
    animation: bgShift 10s ease infinite;
    overflow: hidden;
    z-index: 9999;         
}

                @keyframes bgShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* ── FLOATING ORBS ── */
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    opacity: 0.35;
                    animation: orbFloat linear infinite;
                    pointer-events: none;
                }
                .orb-1 {
                    width: 320px; height: 320px;
                    background: radial-gradient(circle, #00c9a7, transparent);
                    top: -80px; left: -80px;
                    animation-duration: 14s;
                }
                .orb-2 {
                    width: 260px; height: 260px;
                    background: radial-gradient(circle, #845ec2, transparent);
                    bottom: -60px; right: -60px;
                    animation-duration: 18s;
                    animation-direction: reverse;
                }
                .orb-3 {
                    width: 180px; height: 180px;
                    background: radial-gradient(circle, #00b4d8, transparent);
                    top: 50%; left: 60%;
                    animation-duration: 22s;
                }
                @keyframes orbFloat {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(30px, -30px) scale(1.08); }
                    66%  { transform: translate(-20px, 20px) scale(0.95); }
                    100% { transform: translate(0, 0) scale(1); }
                }

                /* ── PARTICLES ── */
                .particle {
                    position: absolute;
                    width: 3px; height: 3px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.6);
                    animation: particleDrift linear infinite;
                    pointer-events: none;
                }
                @keyframes particleDrift {
                    0%   { transform: translateY(0) translateX(0); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 0.6; }
                    100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
                }

                /* ── GLASS CARD ── */
                .reg-card {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 480px;
                    background: rgba(255, 255, 255, 0.07);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 24px;
                    padding: 36px 32px 28px;
                    box-shadow:
                        0 8px 40px rgba(0,0,0,0.45),
                        0 0 0 1px rgba(255,255,255,0.06) inset;
                    animation: cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── TITLE ── */
                .reg-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    text-align: center;
                    margin-bottom: 4px;
                    background: linear-gradient(90deg, #00c9a7, #845ec2, #00b4d8, #00c9a7);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: titleShimmer 3s linear infinite;
                    letter-spacing: -0.3px;
                }
                @keyframes titleShimmer {
                    0%   { background-position: 0% center; }
                    100% { background-position: 300% center; }
                }
                .reg-subtitle {
                    text-align: center;
                    color: rgba(255,255,255,0.45);
                    font-size: 0.82rem;
                    margin-bottom: 20px;
                }
                .mandatory-note {
                    font-size: 0.74rem;
                    color: rgba(255,255,255,0.38);
                    text-align: center;
                    margin-top: -12px;
                    margin-bottom: 22px;
                    letter-spacing: 0.2px;
                }
                .mandatory-note span { color: #ff6b6b; font-weight: 700; }

                /* ── GRID ── */
                .field-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .field-group {
                    margin-bottom: 14px;
                    animation: fadeUp 0.4s ease both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── LABELS ── */
                .field-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.65);
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                }
                .req-star {
                    color: #ff6b6b;
                    font-size: 0.9rem;
                }

                /* ── INPUTS ── */
                .reg-input, .reg-select {
                    width: 100%;
                    padding: 10px 14px;
                    font-size: 0.88rem;
                    color: #fff;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 10px;
                    outline: none;
                    transition: all 0.25s;
                    box-sizing: border-box;
                }
                .reg-input::placeholder { color: rgba(255,255,255,0.3); }
                .reg-input:focus, .reg-select:focus {
                    border-color: #00c9a7;
                    box-shadow: 0 0 0 3px rgba(0,201,167,0.2), 0 0 12px rgba(0,201,167,0.15);
                    background: rgba(255,255,255,0.12);
                    transform: translateY(-1px);
                }
                .reg-input.is-invalid {
                    border-color: #ff6b6b;
                    box-shadow: 0 0 0 3px rgba(255,107,107,0.2);
                }

                /* ── SELECT ── */
                .reg-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='rgba(255,255,255,0.5)' d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 13px center;
                    cursor: pointer;
                }
                .reg-select option { background: #302b63; color: #fff; }

                /* ── ERROR ── */
                .error-text {
                    font-size: 0.73rem;
                    color: #ff6b6b;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    animation: slideErr 0.2s ease both;
                }
                @keyframes slideErr {
                    from { opacity: 0; transform: translateX(-6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                /* ── PASSWORD BOX ── */
                .pw-box { position: relative; }
                .pw-box .reg-input { padding-right: 40px; }
                .pw-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.92rem;
                    transition: color 0.2s;
                }
                .pw-toggle:hover { color: #00c9a7; }

                /* ── DIVIDER ── */
                .divider-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 6px 0 16px;
                }
                .divider-label::before, .divider-label::after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                }

                /* ── REGISTER BUTTON ── */
                .btn-register {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #00c9a7, #845ec2);
                    background-size: 200% auto;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.3s;
                    letter-spacing: 0.5px;
                    margin-top: 8px;
                    position: relative;
                    overflow: hidden;
                    animation: fadeUp 0.5s 0.3s ease both;
                }
                .btn-register::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .btn-register:hover:not(:disabled) {
                    background-position: right center;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,201,167,0.4);
                }
                .btn-register:hover:not(:disabled)::after { opacity: 1; }
                .btn-register:active:not(:disabled) { transform: translateY(0); }
                .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

                /* ── CANCEL BUTTON ── */
                .btn-cancel {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    background: transparent;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-top: 10px;
                }
                .btn-cancel:hover:not(:disabled) {
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    background: rgba(255,107,107,0.08);
                }
                .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── SUCCESS BANNER ── */
                .success-banner {
                    background: linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,180,216,0.2));
                    border: 1px solid rgba(0,201,167,0.4);
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.87rem;
                    font-weight: 600;
                    color: #00c9a7;
                    margin-bottom: 16px;
                    animation: successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes successPop {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <ErrorModal message={errorMsg} onClose={() => setErrorMsg("")} />

            <div className="reg-page">
                {/* Orbs */}
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />

                {/* Particles */}
                {Array.from({ length: 18 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: `-10px`,
                            animationDuration: `${6 + Math.random() * 10}s`,
                            animationDelay: `${Math.random() * 8}s`,
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`,
                            opacity: 0.4 + Math.random() * 0.4,
                        }}
                    />
                ))}

                <div className="reg-card">
                    <div className="reg-title">Create Account</div>
                    <div className="reg-subtitle">Join 4K Fresh &mdash; fill in your details</div>

                    {message && (
                        <div className="success-banner">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: "1.1rem" }} />
                            {message}
                        </div>
                    )}

                    <p className="mandatory-note">
                        Fields marked <span>*</span> are mandatory
                    </p>

                    {/* Name Row */}
                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">First Name <span className="req-star">*</span></label>
                            <input
                                ref={firstNameRef}
                                type="text"
                                placeholder="First name"
                                className={`reg-input ${errors.firstName ? "is-invalid" : ""}`}
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value); setErrors((p: any) => ({ ...p, firstName: undefined })); }}
                            />
                            {errors.firstName && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.firstName}</div>}
                        </div>
                        <div className="field-group">
                            <label className="field-label">Last Name <span className="req-star">*</span></label>
                            <input
                                ref={lastNameRef}
                                type="text"
                                placeholder="Last name"
                                className={`reg-input ${errors.lastName ? "is-invalid" : ""}`}
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value); setErrors((p: any) => ({ ...p, lastName: undefined })); }}
                            />
                            {errors.lastName && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.lastName}</div>}
                        </div>
                    </div>

                    {/* Email & Mobile Row */}
                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">Email <span className="req-star">*</span></label>
                            <input
                                ref={emailRef}
                                type="email"
                                placeholder="you@email.com"
                                className={`reg-input ${errors.emailId ? "is-invalid" : ""}`}
                                value={emailId}
                                onChange={(e) => { setEmailId(e.target.value); setErrors((p: any) => ({ ...p, emailId: undefined })); }}
                            />
                            {errors.emailId && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.emailId}</div>}
                        </div>
                        <div className="field-group">
                            <label className="field-label">Mobile <span className="req-star">*</span></label>
                            <input
                                ref={mobileRef}
                                type="text"
                                placeholder="10-digit"
                                className={`reg-input ${errors.mobile ? "is-invalid" : ""}`}
                                value={mobile}
                                onChange={(e) => { setMobile(e.target.value); setErrors((p: any) => ({ ...p, mobile: undefined })); }}
                            />
                            {errors.mobile && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.mobile}</div>}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="field-group">
                        <label className="field-label">Location <span className="req-star">*</span></label>
                        <select
                            className="reg-select"
                            value={locationID}
                            onChange={(e) => {
                                setLocationID(Number(e.target.value));
                                setErrors((prev: any) => ({ ...prev, location: undefined }));
                            }}
                        >
                            <option value={0}>— Select Location —</option>
                            {locations.map((loc: any) => (
                                <option key={loc.locationID} value={loc.locationID}>{loc.locationName}</option>
                            ))}
                        </select>
                        {errors.location && (
                            <div className="error-text">
                                <i className="bi bi-exclamation-circle-fill" />
                                {errors.location}
                            </div>
                        )}
                    </div>

                    <div className="divider-label"> SECURITY</div>

                    {/* Password */}
                    <div className="field-group">
                        <label className="field-label">Password <span className="req-star">*</span></label>
                        <div className="pw-box">
                            <input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                className={`reg-input ${errors.password ? "is-invalid" : ""}`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors((p: any) => ({ ...p, password: undefined })); }}
                            />
                            {password && (
                                <span className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                                </span>
                            )}
                        </div>
                        {errors.password && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.password}</div>}
                    </div>

                    {/* Confirm Password */}
                    <div className="field-group">
                        <label className="field-label">Confirm Password <span className="req-star">*</span></label>
                        <div className="pw-box">
                            <input
                                ref={confirmPasswordRef}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                className={`reg-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p: any) => ({ ...p, confirmPassword: undefined })); }}
                            />
                            {confirmPassword && (
                                <span className="pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <i className={showConfirmPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                                </span>
                            )}
                        </div>
                        {errors.confirmPassword && <div className="error-text"><i className="bi bi-exclamation-circle-fill" />{errors.confirmPassword}</div>}
                    </div>

                    <button
                        type="button"
                        className="btn-register"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Registering...
                            </>
                        ) : (
                            <><i className="bi bi-person-plus-fill me-2" />Register</>
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setIsRegister(false)}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-left me-1" />Back to Login
                    </button>
                </div>
            </div>
        </>
    );
}