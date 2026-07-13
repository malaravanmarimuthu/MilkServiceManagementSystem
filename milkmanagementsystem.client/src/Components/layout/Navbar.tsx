import { NavLink } from "react-router-dom";
import { useState } from "react";
import ConfirmModal from "../Common/ConfirmModal";
import logo from "../../assets/images/logo.jpg";

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
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

                .navbar-fresh {
                    background: linear-gradient(135deg, #1a6b3c 0%, #2ecc8e 50%, #1a6b3c 100%);
                    background-size: 200% 200%;
                    animation: gradientShift 6s ease infinite;
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .navbar-fresh::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 100%);
                    pointer-events: none;
                }

                .navbar-inner { padding: 10px 0; }

                .nav-brand-fresh {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: 1.65rem;
                    color: #fff !important;
                    letter-spacing: -0.5px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-decoration: none;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .brand-icon {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.22);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    backdrop-filter: blur(4px);
                    border: 1.5px solid rgba(255,255,255,0.35);
                }

                .nav-link-fresh {
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.88) !important;
                    padding: 8px 15px !important;
                    border-radius: 100px;
                    transition: all 0.22s ease;
                    text-decoration: none;
                }

                .nav-link-fresh:hover {
                    color: #fff !important;
                    background: rgba(255,255,255,0.18);
                }

                .nav-link-fresh.active {
                    color: #fff !important;
                    background: rgba(255,255,255,0.22);
                    font-weight: 600;
                }

                .nav-login-btn {
                    background: #fff !important;
                    color: #0f9b58 !important;
                    border-radius: 100px !important;
                    padding: 9px 26px !important;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border: none !important;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                    letter-spacing: 0.2px;
                }

                .nav-login-btn:hover {
                    background: #f0fff8 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 22px rgba(0,0,0,0.18);
                    color: #0a7a44 !important;
                }

                .nav-master-toggle {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    color: rgba(255,255,255,0.92) !important;
                    font-size: 0.9rem;
                    padding: 8px 15px !important;
                    border-radius: 100px;
                    transition: all 0.22s;
                }

                .nav-master-toggle:hover {
                    background: rgba(255,255,255,0.18);
                    color: #fff !important;
                }

                .nav-dropdown-fresh {
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.18);
                    padding: 8px;
                    margin-top: 10px;
                    background: #fff;
                    min-width: 200px;
                }

                .nav-dropdown-fresh .dropdown-item {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.88rem;
                    font-weight: 500;
                    color: #1a4a35;
                    border-radius: 10px;
                    padding: 10px 14px;
                    transition: all 0.18s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-dropdown-fresh .dropdown-item:hover {
                    background: linear-gradient(135deg, rgba(15,155,88,0.1), rgba(72,149,239,0.1));
                    color: #0f9b58;
                    padding-left: 18px;
                }

                .nav-logout-btn {
                    background: rgba(255,255,255,0.15) !important;
                    color: #fff !important;
                    border: 1.5px solid rgba(255,255,255,0.5) !important;
                    border-radius: 100px !important;
                    padding: 8px 22px !important;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.88rem;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(4px);
                }

                .nav-logout-btn:hover {
                    background: rgba(255,255,255,0.28) !important;
                    color: #fff !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                }

                .navbar-toggler {
                    border: 1.5px solid rgba(255,255,255,0.5) !important;
                    border-radius: 10px !important;
                    padding: 6px 10px !important;
                }

                .navbar-toggler-icon { filter: brightness(0) invert(1); }

                .nav-divider {
                    width: 1px;
                    height: 22px;
                    background: rgba(255,255,255,0.25);
                    margin: 0 6px;
                }

                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>

            <nav className="navbar navbar-expand-lg navbar-fresh sticky-top">
                <div className="container navbar-inner">

                    <NavLink to="/" className="nav-brand-fresh">
                        <img
                            src={logo}
                            alt="logo"
                            style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "contain"
                            }}
                        />
                        4K FRESH
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
                                    <li className="nav-item">
                                        <div className="nav-divider d-none d-lg-block"></div>
                                    </li>
                                    <li className="nav-item ms-lg-1 mt-2 mt-lg-0">
                                        <NavLink to="/login" className="btn nav-login-btn">
                                            Login
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                        {isAdmin ? (
                                            <>
                                                <li className="nav-item">
                                                    <NavLink to="/dashboard" className="nav-link nav-link-fresh">
                                                        Dashboard
                                                    </NavLink>
                                                </li>

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
                                                            <NavLink className="dropdown-item" to="/location">Location</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/role">Role</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/employee">Employee</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/subscription">Subscription</NavLink>
                                                        </li>
                                                        
                                                    </ul>
                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle nav-master-toggle"
                                                        href="#"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Consumption
                                                    </a>

                                                    <ul className="dropdown-menu nav-dropdown-fresh">
                                                        
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/employeesubscription">Employee Subscription</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/leave-request">Leave Request</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/milk-Consumption">
                                                                Milk Consumption
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/view-past-consumption">
                                                                View Past Consumption
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/payment-history">
                                                                Payment History
                                                            </NavLink>
                                                        </li>
                                                         <li>
                                                            <NavLink className="dropdown-item" to="/My-consumption">
                                                                Employee Consumption
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/Monthly-Sales-History">
                                                                Monthly Sales History
                                                            </NavLink>
                                                           
                                                        </li>
                                                        <li>
                                                            <NavLink className="dropdown-item" to="/invoice">
                                                                Invoice
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle nav-master-toggle"
                                                        href="#"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Procurement
                                                    </a>

                                                    <ul className="dropdown-menu nav-dropdown-fresh">

                                                        <li>
                                                            <NavLink className="dropdown-item" to="/procurement-rate">
                                                                Procurement Price
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item">
                                                    <NavLink to="/my-profile" className="nav-link nav-link-fresh">
                                                        My Profile
                                                    </NavLink>
                                                </li>
                                            </>
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
                                                        <NavLink to="/My-Consumption" className="nav-link nav-link-fresh">
                                                            MyConsumption
                                                </NavLink>
                                            </li>
                                                    <li className="nav-item">
                                                        <NavLink to="/payment-history" className="nav-link nav-link-fresh">
                                                            Payment History
                                                        </NavLink>
                                                    </li>
                                                    <li className="nav-item">
                                                        <NavLink to="/my-bills" className="nav-link nav-link-fresh">
                                                            My Bills
                                                        </NavLink>
                                                    </li>

                                        </>
                                    )}

       
                                    <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
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