/* eslint-disable react-hooks/purity */
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";
import { validateLoginForm } from "../Helpers/Validation";
import type { LoginErrors } from "../Helpers/Validation";
import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "./Common/ErrorModal";

type Props = {
    setIsRegister: (value: boolean) => void;
};

export default function LoginForm({ setIsRegister }: Props) {
    const navigate = useNavigate();

    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const mobileRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const validationErrors = validateLoginForm({ mobile, password });
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            if (validationErrors.mobile) mobileRef.current?.focus();
            else if (validationErrors.password) passwordRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.post(config.AUTH_URL + "/Auth/login", { mobile, password });
            localStorage.setItem("token", response.data.data.jwtToken);
            localStorage.setItem("refreshToken", response.data.data.refreshToken);
            setMessage("Login Successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            setErrorMsg(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                /* ── PAGE BACKGROUND ── */
                .login-page {
                    min-height: 100vh;
                    width: 100vw;
                    position: fixed;
                    top: 0; left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                    background-size: 400% 400%;
                    animation: lgBgShift 10s ease infinite;
                    overflow: hidden;
                    z-index: 9999;
                    padding: 24px 16px;
                }
                @keyframes lgBgShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* ── ORBS ── */
                .lg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    opacity: 0.35;
                    animation: lgOrbFloat linear infinite;
                    pointer-events: none;
                }
                .lg-orb-1 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #00c9a7, transparent);
                    top: -60px; left: -60px;
                    animation-duration: 14s;
                }
                .lg-orb-2 {
                    width: 250px; height: 250px;
                    background: radial-gradient(circle, #845ec2, transparent);
                    bottom: -50px; right: -50px;
                    animation-duration: 18s;
                    animation-direction: reverse;
                }
                .lg-orb-3 {
                    width: 160px; height: 160px;
                    background: radial-gradient(circle, #00b4d8, transparent);
                    top: 55%; left: 65%;
                    animation-duration: 22s;
                }
                @keyframes lgOrbFloat {
                    0%   { transform: translate(0,0) scale(1); }
                    33%  { transform: translate(28px,-28px) scale(1.08); }
                    66%  { transform: translate(-18px,18px) scale(0.95); }
                    100% { transform: translate(0,0) scale(1); }
                }

                /* ── PARTICLES ── */
                .lg-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.6);
                    animation: lgParticleDrift linear infinite;
                    pointer-events: none;
                }
                @keyframes lgParticleDrift {
                    0%   { transform: translateY(0) translateX(0); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 0.6; }
                    100% { transform: translateY(-100vh) translateX(25px); opacity: 0; }
                }

                /* ── GLASS CARD ── */
                .login-glass-card {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 400px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 24px;
                    padding: 40px 32px 32px;
                    box-shadow:
                        0 8px 40px rgba(0,0,0,0.45),
                        0 0 0 1px rgba(255,255,255,0.06) inset;
                    animation: lgCardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes lgCardIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── LOGO ICON ── */
                .login-logo {
                    width: 58px; height: 58px;
                    background: linear-gradient(135deg, #00c9a7, #845ec2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 1.6rem;
                    box-shadow: 0 6px 20px rgba(0,201,167,0.35);
                    animation: lgLogoIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes lgLogoIn {
                    from { opacity: 0; transform: scale(0.6) rotate(-10deg); }
                    to   { opacity: 1; transform: scale(1) rotate(0deg); }
                }

                /* ── TITLE ── */
                .login-title {
                    font-size: 1.7rem;
                    font-weight: 800;
                    text-align: center;
                    margin-bottom: 4px;
                    background: linear-gradient(90deg, #00c9a7, #845ec2, #00b4d8, #00c9a7);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: lgTitleShimmer 3s linear infinite;
                    letter-spacing: -0.3px;
                }
                @keyframes lgTitleShimmer {
                    0%   { background-position: 0% center; }
                    100% { background-position: 300% center; }
                }
                .login-subtitle {
                    text-align: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.8rem;
                    margin-bottom: 28px;
                }

                /* ── FIELD GROUP ── */
                .lg-field-group {
                    margin-bottom: 16px;
                    animation: lgFadeUp 0.4s ease both;
                }
                @keyframes lgFadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .lg-label {
                    font-size: 0.74rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.6);
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }
                .lg-req { color: #ff6b6b; font-size: 0.88rem; }

                /* ── INPUTS ── */
                .lg-input {
                    width: 100%;
                    padding: 11px 14px;
                    font-size: 0.9rem;
                    color: #fff;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 10px;
                    outline: none;
                    transition: all 0.25s;
                    box-sizing: border-box;
                }
                .lg-input::placeholder { color: rgba(255,255,255,0.28); }
                .lg-input:focus {
                    border-color: #00c9a7;
                    box-shadow: 0 0 0 3px rgba(0,201,167,0.2), 0 0 12px rgba(0,201,167,0.12);
                    background: rgba(255,255,255,0.12);
                    transform: translateY(-1px);
                }
                .lg-input.is-invalid {
                    border-color: #ff6b6b;
                    box-shadow: 0 0 0 3px rgba(255,107,107,0.2);
                }

                /* ── PASSWORD BOX ── */
                .lg-pw-box { position: relative; }
                .lg-pw-box .lg-input { padding-right: 42px; }
                .lg-pw-toggle {
                    position: absolute;
                    right: 13px; top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: rgba(255,255,255,0.38);
                    font-size: 0.92rem;
                    transition: color 0.2s;
                }
                .lg-pw-toggle:hover { color: #00c9a7; }

                /* ── ERROR ── */
                .lg-error {
                    font-size: 0.73rem;
                    color: #ff6b6b;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    animation: lgSlideErr 0.2s ease both;
                }
                @keyframes lgSlideErr {
                    from { opacity: 0; transform: translateX(-6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                /* ── SUCCESS BANNER ── */
                .lg-success {
                    background: linear-gradient(135deg, rgba(0,201,167,0.18), rgba(0,180,216,0.18));
                    border: 1px solid rgba(0,201,167,0.4);
                    border-radius: 10px;
                    padding: 11px 15px;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    font-size: 0.86rem;
                    font-weight: 600;
                    color: #00c9a7;
                    margin-bottom: 18px;
                    animation: lgSuccessPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes lgSuccessPop {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1); }
                }

                /* ── LOGIN BUTTON ── */
                .btn-login {
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
                    letter-spacing: 0.4px;
                    margin-top: 6px;
                    position: relative;
                    overflow: hidden;
                }
                .btn-login:hover:not(:disabled) {
                    background-position: right center;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,201,167,0.38);
                }
                .btn-login:active:not(:disabled) { transform: translateY(0); }
                .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

                /* ── DIVIDER ── */
                .lg-divider {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.25);
                    margin: 20px 0 16px;
                }
                .lg-divider::before, .lg-divider::after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                }

                /* ── CANCEL / REGISTER BUTTONS ── */
                .btn-lg-outline {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    font-size: 0.86rem;
                    font-weight: 500;
                    background: transparent;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-top: 10px;
                    display: block;
                    text-align: center;
                    text-decoration: none;
                }
                .btn-lg-outline:hover {
                    border-color: rgba(255,255,255,0.35);
                    color: rgba(255,255,255,0.85);
                    background: rgba(255,255,255,0.06);
                }
                .btn-lg-register {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid rgba(0,201,167,0.35);
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    background: rgba(0,201,167,0.08);
                    color: #00c9a7;
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-top: 10px;
                }
                .btn-lg-register:hover:not(:disabled) {
                    background: rgba(0,201,167,0.16);
                    border-color: #00c9a7;
                    box-shadow: 0 4px 16px rgba(0,201,167,0.2);
                    transform: translateY(-1px);
                }
                .btn-lg-register:disabled { opacity: 0.5; cursor: not-allowed; }

                .no-account-text {
                    text-align: center;
                    color: rgba(255,255,255,0.35);
                    font-size: 0.78rem;
                    margin-top: 18px;
                    margin-bottom: 0;
                }
            `}</style>

            <ErrorModal message={errorMsg} onClose={() => setErrorMsg("")} />

            <div className="login-page">
                {/* Orbs */}
                <div className="lg-orb lg-orb-1" />
                <div className="lg-orb lg-orb-2" />
                <div className="lg-orb lg-orb-3" />

                {/* Particles */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="lg-particle"
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

                <div className="login-glass-card">
                    {/* Logo Icon */}
                    <div className="login-logo">
                        <i className="bi bi-droplet-fill" style={{ color: "#fff" }} />
                    </div>

                    <div className="login-title">4K Fresh</div>

                    {message && (
                        <div className="lg-success">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: "1rem" }} />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Mobile */}
                        <div className="lg-field-group">
                            <label className="lg-label">
                                Mobile
                            </label>
                            <input
                                ref={mobileRef}
                                type="text"
                                placeholder="Enter your mobile number"
                                className={`lg-input ${errors.mobile ? "is-invalid" : ""}`}
                                value={mobile}
                                onChange={(e) => {
                                    setMobile(e.target.value);
                                    setErrors(prev => ({ ...prev, mobile: undefined }));
                                }}
                            />
                            {errors.mobile && (
                                <div className="lg-error">
                                    <i className="bi bi-exclamation-circle-fill" />
                                    {errors.mobile}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="lg-field-group">
                            <label className="lg-label">
                                Password
                            </label>
                            <div className="lg-pw-box">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className={`lg-input ${errors.password ? "is-invalid" : ""}`}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                />
                                {password && (
                                    <span className="lg-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                                    </span>
                                )}
                            </div>
                            {errors.password && (
                                <div className="lg-error">
                                    <i className="bi bi-exclamation-circle-fill" />
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="btn-login"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right me-2" />
                                    Login
                                </>
                            )}
                        </button>

                        {/* Cancel */}
                        <Link to="/" className="btn-lg-outline">
                            <i className="bi bi-arrow-left me-1" />
                            Back to Home
                        </Link>

                        {/* Register */}
                        <div className="lg-divider">or</div>

                        <p className="no-account-text">Don't have an account?</p>

                        <button
                            type="button"
                            className="btn-lg-register"
                            onClick={() => setIsRegister(true)}
                            disabled={loading}
                        >
                            <i className="bi bi-person-plus me-2" />
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}