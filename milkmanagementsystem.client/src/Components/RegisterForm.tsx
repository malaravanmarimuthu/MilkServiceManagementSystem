import { useState, useRef } from "react";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";
import { validateRegisterForm } from "../Helpers/Validation";
import type { RegisterErrors } from "../Helpers/Validation";
import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "./Common/ErrorModal";
import { getLocations } from "../Services/LocationService";
import { useEffect } from "react";


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
    const [messageType, setMessageType] = useState("");

    const [errors, setErrors] = useState<RegisterErrors>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const mobileRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const data = await getLocations();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegister = async () => {

        const validationErrors = validateRegisterForm({
            firstName,
            lastName,
            emailId,
            mobile,
            password,
            confirmPassword,
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
        if (locationID === 0) {
            setErrorMsg("Please select a location");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post(config.AUTH_URL + "/Auth/signup", {
                firstName,
                lastName,
                password,
                emailId,
                mobile,
                locationID,
            });

            setMessage("Registration Successful");
            setMessageType("success");

            setFirstName("");
            setLastName("");
            setEmailId("");
            setMobile("");
            setPassword("");
            setConfirmPassword("");
            setLocationID(0);

            setTimeout(() => setIsRegister(false), 1500);

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

            <h1>Register</h1>

            {message && (
                <div className={`alert alert-${messageType}`}>
                    {message}
                </div>
            )}

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

            {errors.firstName && (
                <span className="text-danger small mb-2 d-block">
                    {errors.firstName}
                </span>
            )}

            <input
                ref={lastNameRef}
                type="text"
                placeholder="Last Name"
                className={`form-control mb-1 ${errors.lastName ? "is-invalid" : ""}`}
                value={lastName}
                onChange={(e) => {
                    setLastName(e.target.value);
                    setErrors(prev => ({ ...prev, lastName: undefined }));
                }}
            />

            {errors.lastName && (
                <span className="text-danger small mb-2 d-block">
                    {errors.lastName}
                </span>
            )}

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

            {errors.emailId && (
                <span className="text-danger small mb-2 d-block">
                    {errors.emailId}
                </span>
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

            <select
                className="form-control mb-3"
                value={locationID}
                onChange={(e) => setLocationID(Number(e.target.value))}
            >
                <option value={0}>Select Location</option>

                {locations.map((loc: any) => (
                    <option
                        key={loc.locationID}
                        value={loc.locationID}
                    >
                        {loc.locationName}
                    </option>
                ))}
            </select>


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
                        <i
                            className={
                                showConfirmPassword
                                    ? "bi bi-eye-slash-fill"
                                    : "bi bi-eye-fill"
                            }
                        />
                    </span>
                )}
            </div>

            {errors.confirmPassword && (
                <span className="text-danger small mb-2 d-block">
                    {errors.confirmPassword}
                </span>
            )}

            <button
                type="button"
                className="btn btn-success w-100 mt-3"
                onClick={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                        Registering...
                    </>
                ) : (
                    "Register"
                )}
            </button>

            <button
                type="button"
                className="btn btn-danger w-100 mt-2"
                onClick={() => setIsRegister(false)}
                disabled={loading}
            >
                Cancel
            </button>
        </>
    );
}