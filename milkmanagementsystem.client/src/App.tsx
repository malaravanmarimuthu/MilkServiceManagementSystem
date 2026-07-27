import { BrowserRouter, Routes, Route, useLocation, } from "react-router-dom";
import Navbar from "./Components/layout/Navbar";
import Home from "./Pages/Home";
import About from "./Components/home/About";
import Service from "./Components/home/Service";
import Pricing from "./Components/home/Pricing";
import Contact from "./Components/home/Contact";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Location from "./Pages/Location";
import ProtectedRoute from "./Routing/ProtectedRoute";
import Role from "./Pages/Role";
import Footer from "./Components/Common/Footer";
import Employee from "./Pages/Employee";
import Subscription from "./Pages/Subscription";
import EmployeeSubscription from "./Pages/EmployeeSubscription";
import LeaveRequest from "./Pages/LeaveRequest";
import MyProfile from "./Pages/MyProfile";
import MilkConsumption from "./Pages/MilkConsumption";
import ViewPastConsumption from "./Pages/ViewPastConsumption";
import MyConsumption from "./Pages/MyConsumption";
import PaymentHistory from "./Pages/PaymentHistory";
import Invoice from "./Pages/Invoice";
import MonthlySalesHistory from "./Pages/MonthlySalesHistory";
import MyBills from "./Pages/MyBills";
import ProcurementRate from "./Pages/ProcurementRate";
import ProcurementEntry from "./Pages/ProcurementEntry";
import ProcurementMonthlySalesHistory from "./Pages/ProcurementMonthlySalesHistory";
import Expense from "./Pages/Expense";
import PieChartReport from "./Pages/PieChartReport";
import BarChartReport from "./Pages/BarChartReport";
import EmployeeLocationPhoto from "./Pages/EmployeeLocationPhoto";
import DeliveryRoute from "./Pages/DeliveryRoute";



function AppContent() {

    const location = useLocation();

    // LOGIN PAGE CHECK

    const hideNavbar =
        location.pathname === "/login";

    const hideFooter =
        location.pathname === "/login" ||
        location.pathname === "/register";


    return (
        <>
            {!hideNavbar && <Navbar />}

            <div className="d-flex flex-column min-vh-100">

                <div className="flex-grow-1">

                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/service" element={<Service />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/role" element={<ProtectedRoute><Role /></ProtectedRoute>} />
                        <Route path="/employee" element={<ProtectedRoute><Employee /></ProtectedRoute>} />
                        <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
                        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                        <Route path="/EmployeeSubscription" element={<ProtectedRoute><EmployeeSubscription /></ProtectedRoute>} />
                        <Route path="/leave-request" element={<ProtectedRoute> <LeaveRequest /></ProtectedRoute>} />
                        <Route path="/milk-Consumption" element={<ProtectedRoute><MilkConsumption /></ProtectedRoute>} />
                        <Route path="/My-Profile" element={<ProtectedRoute> <MyProfile /></ProtectedRoute>} />
                        <Route path="/View-Past-Consumption" element={<ProtectedRoute><ViewPastConsumption /></ProtectedRoute>} />
                        <Route path="/My-Consumption" element={<ProtectedRoute><MyConsumption /></ProtectedRoute>} />
                        <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                        <Route path="/Monthly-Sales-History" element={<ProtectedRoute><MonthlySalesHistory /></ProtectedRoute>} />
                        <Route path="/My-Consumption" element={<ProtectedRoute><MyConsumption /></ProtectedRoute>} />
                        <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                        <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
                        <Route path="/my-bills" element={<ProtectedRoute><MyBills /></ProtectedRoute>} />
                        <Route path="/procurement-entry" element={<ProtectedRoute><ProcurementEntry /></ProtectedRoute>} />
                        <Route path="/procurement-rate" element={<ProtectedRoute><ProcurementRate /></ProtectedRoute>} />
                        <Route path="/procurement-monthly-sales-history" element={<ProtectedRoute><ProcurementMonthlySalesHistory /></ProtectedRoute> } />
                        <Route path="/expense" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
                        <Route path="/procurement-monthly-sales-history" element={<ProtectedRoute><ProcurementMonthlySalesHistory /></ProtectedRoute>} />
                        <Route path="/pie-chart-report" element={<ProtectedRoute><PieChartReport /></ProtectedRoute>} />
                        <Route path="/bar-chart-report" element={<ProtectedRoute><BarChartReport /></ProtectedRoute>} />
                        <Route path="/Employee-Location-Photo" element={<ProtectedRoute><EmployeeLocationPhoto /></ProtectedRoute>} />
                        <Route path="/Delivery-Route" element={<ProtectedRoute><DeliveryRoute /></ProtectedRoute>} />


                    </Routes>
                </div>

                {!hideFooter && <Footer />}

            </div>

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