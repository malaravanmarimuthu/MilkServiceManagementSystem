import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";
import { validateLoginForm } from "../Helpers/Validation";
import type { LoginErrors } from "../Helpers/Validation";
import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "./ErrorModal";

type Props = {
    setIsRegister: (value: boolean) => void;
};

export default function LoginForm({ setIsRegister }: Props) {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleLogin = async () => {

        const validationErrors = validateLoginForm({ username, password });
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            if (validationErrors.username) usernameRef.current?.focus();
            else if (validationErrors.password) passwordRef.current?.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                config.AUTH_URL + "/Auth/login",
                { username, password }
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

            {message &&
                <div className={`alert alert-${messageType}`}>
                    {message}
                </div>
            }

            <input
                ref={usernameRef}
                type="text"
                placeholder="Username"
                className={`form-control mb-1 ${errors.username ? "is-invalid" : ""}`}
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors(prev => ({ ...prev, username: undefined }));
                }}
            />
            {errors.username &&
                <span className="text-danger small mb-2 d-block">{errors.username}</span>
            }

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
                        <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                    </span>
                )}
            </div>
            {errors.password &&
                <span className="text-danger small mb-2 d-block">{errors.password}</span>
            }

            <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Logging in...</>
                    : "Login"
                }
            </button>

            <Link to="/" className="btn btn-outline-secondary w-100 mt-3">
                Cancel
            </Link>

            <p className="mt-4 text-center">Don't have an account?</p>

            <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setIsRegister(true)}
                disabled={loading}
            >
                Register
            </button>
        </>
    );
}