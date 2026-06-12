import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../Components/layout/ConfirmModal";

interface JwtPayload {
    username: string;
    firstname: string;
    userid: string;
}

function Dashboard() {
    const token = localStorage.getItem("token");
    const [open, setOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    let username = "";

    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        username = decoded.username;
    }

    return (
        <div>
            <h2>Welcome {username}</h2>

            <button
                onClick={() => setOpen(!open)}
                style={{
                    fontSize: "30px",
                    border: "none",
                    background: "none",
                    cursor: "pointer"
                }}
            >
                ☰
            </button>

            {open && (
                <div
                    style={{
                        width: "220px",
                        border: "1px solid #ccc",
                        padding: "10px",
                        position: "absolute",
                        background: "white"
                    }}
                >
                    <p style={{ cursor: "pointer" }} onClick={() => navigate("/customers")}>Customers</p>
                    <p style={{ cursor: "pointer" }} onClick={() => navigate("/location")}>Location</p>
                    <p style={{ cursor: "pointer" }} onClick={() => navigate("/milk-entry")}>Milk Entry</p>
                    <p style={{ cursor: "pointer" }} onClick={() => navigate("/role")}>Role</p>
                    <p style={{ cursor: "pointer" }} onClick={() => navigate("/reports")}>Reports</p>

                    <p
                        onClick={() => setShowLogoutModal(true)}
                        style={{ cursor: "pointer" }}
                    >
                        Logout
                    </p>
                </div>
            )}

            {showLogoutModal && (
                <ConfirmModal
                    message="Are you sure you want to logout?"
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleLogout}
                />
            )}
        </div>
    );
}

export default Dashboard;