/* eslint-disable @typescript-eslint/no-unused-vars */
import { NavLink } from "react-router-dom";
import { useState } from "react";
import ConfirmModal from "../Common/ConfirmModal";

const getRoleFromToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.rolename;
    } catch {
        return null;
    }
};

function Navbar() {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;
    const isAdmin = getRoleFromToken() === "Admin";

    return (
        <>
            <style>{`
                .navbar-fresh {
                    background: #FBF7EE;
                    border-bottom: 1px solid rgba(27,67,50,0.08);
                    padding: 14px 0;
                }
                .nav-brand-fresh {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 700;
                    font-size: 1.7rem;
                    color: #1B4332 !important;
                    letter-spacing: -0.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nav-brand-fresh .brand-dot {
                    width: 9px; height: 9px;
                    border-radius: 50%;
                    background: #4895EF;
                    display: inline-block;
                    margin-left: 2px;
                }
                .nav-link-fresh {
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    font-size: 0.92rem;
                    color: #3F5249 !important;
                    padding: 8px 16px !important;
                    border-radius: 100px;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .nav-link-fresh:hover {
                    color: #1B4332 !important;
                    background: rgba(82,183,136,0.1);
                }
                .nav-link-fresh.active {
                    color: #1B4332 !important;
                    font-weight: 600;
                }
                .nav-login-btn {
                    background: #1B4332 !important;
                    color: #fff !important;
                    border-radius: 100px !important;
                    padding: 9px 26px !important;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.88rem;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 14px rgba(27,67,50,0.2);
                }
                .nav-login-btn:hover {
                    background: #14302A !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(27,67,50,0.28);
                }
                .nav-master-toggle {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    color: #1B4332 !important;
                    font-size: 0.92rem;
                }
                .nav-dropdown-fresh {
                    border: none;
                    border-radius: 14px;
                    box-shadow: 0 12px 32px rgba(27,67,50,0.15);
                    padding: 8px;
                    margin-top: 10px;
                }
                .nav-dropdown-fresh .dropdown-item {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.88rem;
                    font-weight: 500;
                    color: #3F5249;
                    border-radius: 8px;
                    padding: 9px 14px;
                    transition: all 0.2s;
                }
                .nav-dropdown-fresh .dropdown-item:hover {
                    background: rgba(82,183,136,0.12);
                    color: #1B4332;
                }
                .nav-logout-btn {
                    background: #fff !important;
                    color: #D62828 !important;
                    border: 1.5px solid #D62828 !important;
                    border-radius: 100px !important;
                    padding: 8px 24px !important;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.88rem;
                    transition: all 0.25s ease;
                }
                .nav-logout-btn:hover {
                    background: #D62828 !important;
                    color: #fff !important;
                }
            `}</style>

            <nav className="navbar navbar-expand-lg navbar-fresh sticky-top">
                <div className="container">

                    <NavLink to="/" className="nav-brand-fresh">
                        4K FRESH<span className="brand-dot" />
                    </NavLink>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-1">

                            {!isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink to="/" className="nav-link nav-link-fresh">Home</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/about" className="nav-link nav-link-fresh">About</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/service" className="nav-link nav-link-fresh">Service</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/pricing" className="nav-link nav-link-fresh">Pricing</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/contact" className="nav-link nav-link-fresh">Contact</NavLink>
                                    </li>
                                    <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                        <NavLink to="/login" className="btn nav-login-btn">
                                            Login
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {isAdmin ? (
                                        <li className="nav-item dropdown">
                                            <a
                                                className="nav-link dropdown-toggle nav-master-toggle"
                                                href="#"
                                                role="button"
                                                data-bs-toggle="dropdown"
                                            >
                                                Master
                                            </a>
                                            <ul className="dropdown-menu nav-dropdown-fresh">
                                                <li>
                                                    <NavLink className="dropdown-item" to="/location">
                                                        Location
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink className="dropdown-item" to="/role">
                                                        Role
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink className="dropdown-item" to="/employee">
                                                        Employee
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink className="dropdown-item" to="/subscription">
                                                        Subscription
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink className="dropdown-item" to="/Employeesubscription">
                                                        EmployeeSubscription
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink className="dropdown-item" to="/leave-request">
                                                        Leave Request
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>
                                    ) : (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/my-profile" className="nav-link nav-link-fresh">
                                                    My Profile
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/leave-request" className="nav-link nav-link-fresh">
                                                    Leave Request
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subscription" className="nav-link nav-link-fresh">
                                                    Subscription
                                                </NavLink>
                                            </li>
                                        </>
                                    )}
                                    <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                        <button
                                            className="btn nav-logout-btn"
                                            onClick={() => setShowLogoutModal(true)}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )}

                        </ul>
                    </div>

                </div>
            </nav>

            {showLogoutModal && (
                <ConfirmModal
                    title="Confirm Logout"
                    message="Are you sure you want to logout?"
                    confirmText="Logout"
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                        window.location.href = "/";
                    }}
                />
            )}
        </>
    );
}

export default Navbar;