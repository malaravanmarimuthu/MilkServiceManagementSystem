/* eslint-disable @typescript-eslint/no-unused-vars */
import { NavLink } from "react-router-dom";
import { useState } from "react";
import ConfirmModal from "../Common/ConfirmModal";

function Navbar() {

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    return (
        <>

        <nav
            className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
        >

            <div className="container">

                {/* LOGO */}

                <NavLink
                    to="/"
                    className="navbar-brand fw-bold text-info fs-2"
                >

                    4K FRESH

                </NavLink>

                {/* MOBILE BUTTON */}

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >

                    <span className="navbar-toggler-icon"></span>

                </button>

                {/* MENU */}

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >

                    <ul className="navbar-nav ms-auto align-items-center">

                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/" className="nav-link">Home</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/about" className="nav-link">About</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/service" className="nav-link">Service</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/pricing" className="nav-link">Pricing</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/contact" className="nav-link">Contact</NavLink>
                                </li>

                                <li className="nav-item ms-3">
                                    <NavLink
                                        to="/login"
                                        className="btn btn-info text-white rounded-pill px-4"
                                    >
                                        Login
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                        <li className="nav-item dropdown">
                                            <a
                                                className="nav-link dropdown-toggle fw-bold"
                                                href="#"
                                                role="button"
                                                data-bs-toggle="dropdown"
                                            >
                                                Master
                                            </a>

                                            <ul className="dropdown-menu">
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
                                            </ul>
                                        </li>

                                <li className="nav-item ms-3">
                                    <button
                                        className="btn btn-danger rounded-pill px-4"
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