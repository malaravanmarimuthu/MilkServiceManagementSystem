import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, NavLink } from "react-router-dom";
import ConfirmModal from "../Components/Common/ConfirmModal";

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
                    <p>Customers</p>
                    <p>Location</p>
                    <p>Milk Entry</p>

                    <NavLink
                        to="/role"
                        style={({ isActive }) => ({
                            display: "block",
                            margin: "8px 0",
                            textDecoration: "none",
                            color: isActive ? "#0d6efd" : "#212529",
                            fontWeight: isActive ? "bold" : "normal",
                            cursor: "pointer"
                        })}
                    >
                        Role
                    </NavLink>

                    <p>Reports</p>

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
                    title="Confirm Logout"
                    message="Are you sure you want to logout?"
                    confirmText="Logout"
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleLogout}
                />
            )}
        </div>
    );
}

export default Dashboard;