import { useState } from "react";
import axiosInstance from "../Interceptors/axiosInstance";
import config from "../config";

type Props = {
    setIsRegister: (value: boolean) => void;
};

export default function RegisterForm({
    setIsRegister
}: Props) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [mobile, setMobile] = useState("");
    const [OrgId, setOrgId] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleRegister = async () => {

        if (!firstName || !username || !password || !emailId || !mobile) {
            setMessage("All fields are required");
            setMessageType("danger");
            return;
        }

        try {
            await axiosInstance.post(config.AUTH_URL +  "/Auth/signup", {
                firstName,
                lastName,
                username,
                password,
                emailId,
                mobile,
                OrgId
            });

            setMessage("Registration Successful");
            setMessageType("success");

            setFirstName("");
            setLastName("");
            setEmailId("");
            setMobile("");
            setUsername("");
            setPassword("");
            setOrgId("");

            setTimeout(() => {
                setIsRegister(false);
            }, 1500);

        } catch {
            setMessage("Registration Failed");
            setMessageType("danger");
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

            <input
                type="text"
                placeholder="First Name"
                className="form-control mb-3"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Last Name"
                className="form-control mb-3"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                className="form-control mb-3"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
            />

            <input
                type="text"
                placeholder="Mobile"
                className="form-control mb-3"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
            />

            <input
                type="text"
                placeholder="OrgId"
                className="form-control mb-3"
                value={OrgId}
                onChange={(e) => setOrgId(e.target.value)}
            />

            <input
                type="text"
                placeholder="Username"
                className="form-control mb-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <div className="password-box mb-3">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"} />
                </span>
            </div>

            <button
                className="btn btn-success w-100 mt-3"
                onClick={handleRegister}
            >
                Register
            </button>

            <button
                className="btn btn-danger w-100 mt-2"
                onClick={() => setIsRegister(false)}
            >
                Cancel
            </button>
        </>
    );
}