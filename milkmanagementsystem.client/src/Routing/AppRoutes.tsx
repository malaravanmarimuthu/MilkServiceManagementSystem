import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
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

    </Routes>

  );
}

export default AppRoutes;