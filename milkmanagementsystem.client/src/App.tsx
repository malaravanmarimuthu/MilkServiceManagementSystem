import {BrowserRouter,Routes,Route,useLocation,} from "react-router-dom";
import Navbar from "./Components/layout/Navbar";
import Home from "./Pages/Home";
import About from "./Components/home/About";
import Service from "./Components/home/Service";
import Pricing from "./Components/home/Pricing";
import Contact from "./Components/home/Contact";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Routing/ProtectedRoute";

function AppContent() {

  const location = useLocation();

  // LOGIN PAGE CHECK

  const hideNavbar =
      location.pathname === "/login" ||
      location.pathname === "/dashboard";

  return (

    <>

      {/* NAVBAR */}

      {

        !hideNavbar && <Navbar />

      }

      {/* ROUTES */}

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


      </Routes>

    </>

  );

}

function App() {

  return (

    <BrowserRouter>

      <AppContent />

    </BrowserRouter>

  );

}

export default App;