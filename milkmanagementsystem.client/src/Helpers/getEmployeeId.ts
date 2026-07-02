import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    userid: string;
}

export const getLoggedInEmployeeId = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return Number(decoded.userid);
    } catch {
        return null;
    }
};