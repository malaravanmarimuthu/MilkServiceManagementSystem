import { Routes, Route }
from "react-router-dom";

import Home
from "../Pages/Home";

import Login
from "../Pages/Login";

import PatientList
from "../Pages/PatientList";

import ProtectedRoute
from "./ProtectedRoute";

import AddPatient from "../Pages/AddPatient";

import EditPatient from "../Pages/EditPatient";

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
        path="/patients"
        element={

          <ProtectedRoute>

            <PatientList />

          </ProtectedRoute>

        }
      />

      <Route
         path="/patients/add"
         element={
          <ProtectedRoute>

              <AddPatient />

          </ProtectedRoute>
         }
         />

         <Route
         path="/patients/edit/:id"
         element={
          <ProtectedRoute>

              <EditPatient />

          </ProtectedRoute>
         }
         />

    </Routes>

  );
}

export default AppRoutes;