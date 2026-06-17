import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import Location from "../Pages/Location";
import Employee from "../Pages/Employee";
import About from "../Components/home/About";
import Service from "../Components/home/Service";
import Pricing from "../Components/home/Pricing";
import Contact from "../Components/home/Contact";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/about"
                element={<About />}
            />

            <Route
                path="/service"
                element={<Service />}
            />

            <Route
                path="/pricing"
                element={<Pricing />}
            />

            <Route
                path="/contact"
                element={<Contact />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/location"
                element={
                    <ProtectedRoute>
                        <Location />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/employee"
                element={
                    <ProtectedRoute>
                        <Employee />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default AppRoutes;