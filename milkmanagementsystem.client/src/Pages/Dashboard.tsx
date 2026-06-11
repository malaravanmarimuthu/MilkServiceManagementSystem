import { useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    username: string;
    firstname: string;
    userid: string;
}

function Dashboard() {
    const token = localStorage.getItem("token");
    const [open, setOpen] = useState(false);

    let username = "";

    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);

        console.log("DECODED", decoded);

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
                    <p>Dashboard</p>
                    <p>Customers</p>
                    <p>Locations</p>
                    <p>Milk Entry</p>
                    <p>Bills</p>
                    <p>Reports</p>
                    <p>Logout</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;