import { useState, useRef } from "react";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";
import { validateRegisterForm } from "../Helpers/Validation";
import type { RegisterErrors } from "../Helpers/Validation";

type Props = {
    setIsRegister: (value: boolean) => void;
};

export default function RegisterForm({ setIsRegister }: Props) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [mobile, setMobile] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [loading, setLoading] = useState(false);

    const firstNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const mobileRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const handleRegister = async () => {

        const validationErrors = validateRegisterForm({
            firstName, lastName, emailId, mobile, username, password, confirmPassword
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            if (validationErrors.firstName) firstNameRef.current?.focus();
            else if (validationErrors.emailId) emailRef.current?.focus();
            else if (validationErrors.mobile) mobileRef.current?.focus();
            else if (validationErrors.username) usernameRef.current?.focus();
            else if (validationErrors.password) passwordRef.current?.focus();
            else if (validationErrors.confirmPassword) confirmPasswordRef.current?.focus();
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post(config.AUTH_URL + "/Auth/signup", {
                firstName, lastName, username, password, emailId, mobile
            });

            setMessage("Registration Successful");
            setMessageType("success");

            setFirstName(""); setLastName(""); setEmailId("");
            setMobile(""); setUsername(""); setPassword("");
            setConfirmPassword("");

            setTimeout(() => setIsRegister(false), 1500);

        } catch {
            setMessage("Registration Failed");
            setMessageType("danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1>Register</h1>

            {message &&
                <div className={`alert alert-${messageType}`}>
                    {message}
                </div>
            }

            {/* First Name */}
            <input
                ref={firstNameRef}
                type="text"
                placeholder="First Name"
                className={`form-control mb-1 ${errors.firstName ? "is-invalid" : ""}`}
                value={firstName}
                onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors(prev => ({ ...prev, firstName: undefined }));
                }}
            />
            {errors.firstName &&
                <span className="text-danger small mb-2 d-block">{errors.firstName}</span>
            }

            {/* Last Name */}
            <input
                type="text"
                placeholder="Last Name"
                className="form-control mb-3"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />

            {/* Email */}
            <input
                ref={emailRef}
                type="email"
                placeholder="Email"
                className={`form-control mb-1 ${errors.emailId ? "is-invalid" : ""}`}
                value={emailId}
                onChange={(e) => {
                    setEmailId(e.target.value);
                    setErrors(prev => ({ ...prev, emailId: undefined }));
                }}
            />
            {errors.emailId &&
                <span className="text-danger small mb-2 d-block">{errors.emailId}</span>
            }

            {/* Mobile */}
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
            {errors.mobile &&
                <span className="text-danger small mb-2 d-block">{errors.mobile}</span>
            }

            {/* Username */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="password-box mb-1">
                <input
                    ref={confirmPasswordRef}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                />
                {confirmPassword && (
                    <span
                        className="eye-icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <i className={showConfirmPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                    </span>
                )}
            </div>
            {errors.confirmPassword &&
                <span className="text-danger small mb-2 d-block">{errors.confirmPassword}</span>
            }

            <button
                className="btn btn-success w-100 mt-3"
                onClick={handleRegister}
                disabled={loading}
            >
                {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Registering...</>
                    : "Register"
                }
            </button>

            <button
                className="btn btn-danger w-100 mt-2"
                onClick={() => setIsRegister(false)}
                disabled={loading}
            >
                Cancel
            </button>
        </>
    );
}