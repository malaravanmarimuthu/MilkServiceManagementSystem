import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    username: string;
    firstname: string;
    userid: string;
}

function Dashboard() {
    const token = localStorage.getItem("token");

    let firstName = "";

    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        firstName = decoded.firstname;
    }

    return (
        <div className="text-center mt-5">
            <h2>Welcome {firstName}</h2>
        </div>
    );
}

export default Dashboard;