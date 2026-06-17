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
    const [messageType, setMessageType] = useState("");

    const [errors, setErrors] = useState<LoginErrors>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const mobileRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const validationErrors = validateLoginForm({
            mobile,
            password,
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            if (validationErrors.mobile) mobileRef.current?.focus();
            else if (validationErrors.password) passwordRef.current?.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                config.AUTH_URL + "/Auth/login",
                {

                    mobile,
                    password,
                }
            );

            localStorage.setItem("token", response.data.data.jwtToken);
            localStorage.setItem("refreshToken", response.data.data.refreshToken);

            setMessage("Login Successful");
            setMessageType("success");

            setTimeout(() => navigate("/dashboard"), 1500);

        } catch (err) {
            setErrorMsg(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ErrorModal
                message={errorMsg}
                onClose={() => setErrorMsg("")}
            />

            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                {message && (
                    <div className={`alert alert-${messageType}`}>
                        {message}
                    </div>
                )}

                <input
                    ref={mobileRef}
                    type="text"
                    placeholder="Mobile"
                    className={`form-control mb-1 ${errors.mobile ? "is-invalid" : ""}`}
                    value={mobile}
                    onChange={(e) => {
                        setMobile(e.target.value);
                        setErrors(prev => ({ ...prev, mobile: undefined }));
                    }}
                />

                {errors.mobile && (
                    <span className="text-danger small mb-2 d-block">
                        {errors.mobile}
                    </span>
                )}

                <div className="password-box mb-1">
                    <input
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                    />

                    {password && (
                        <span
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i
                                className={
                                    showPassword
                                        ? "bi bi-eye-slash-fill"
                                        : "bi bi-eye-fill"
                                }
                            />
                        </span>
                    )}
                </div>

                {errors.password && (
                    <span className="text-danger small mb-2 d-block">
                        {errors.password}
                    </span>
                )}

                <button
                    type="submit"
                    className="btn btn-primary w-100 mt-3"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </button>

                <Link
                    to="/"
                    className="btn btn-outline-secondary w-100 mt-3"
                >
                    Cancel
                </Link>

                <p className="mt-4 text-center">
                    Don't have an account?
                </p>

                <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setIsRegister(true)}
                    disabled={loading}
                >
                    Register
                </button>

            </form>
        </>
    );
}