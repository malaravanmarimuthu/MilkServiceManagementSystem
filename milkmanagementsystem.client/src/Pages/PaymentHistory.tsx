import React from "react";
import PaymentHistoryTable from "../Components/Common/PaymentHistoryTable";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    userid: string;
    rolename?: string;
}

const PaymentHistory: React.FC = () => {
    const token = localStorage.getItem("token");
    let isAdmin = false;
    let empID = 0;

    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            isAdmin = (decoded.rolename ?? "").toLowerCase() === "admin";
            empID = Number(decoded.userid);
        } catch {
            console.error("Token decode failed");
        }
    }

    return (
        <div className="container-fluid mt-4 px-4 pb-5">
            <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: "#e8f5e9", display: "flex",
                    alignItems: "center", justifyContent: "center",
                }}>
                    <i className="bi bi-clock-history" style={{ fontSize: "1.2rem", color: "#1B4332" }} />
                </div>
                <div>
                    <h4 className="fw-bold mb-0">Payment History</h4>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        {isAdmin ? "All users  3 month blocks" : "Your payment records  3 month blocks"}
                    </div>
                </div>
            </div>

            <PaymentHistoryTable
                isAdmin={isAdmin}
                currentEmployeeID={empID}
            />
        </div>
    );
};

export default PaymentHistory;