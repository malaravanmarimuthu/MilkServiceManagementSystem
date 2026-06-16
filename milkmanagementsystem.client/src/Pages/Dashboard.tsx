import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    username: string;
    firstname: string;
    userid: string;
}

function Dashboard() {
    const token = localStorage.getItem("token");

    let username = "";

    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        username = decoded.username;
    }

    return (
        <div className="text-center mt-5">
            <h2>Welcome {username}</h2>
        </div>
    );
}

export default Dashboard;