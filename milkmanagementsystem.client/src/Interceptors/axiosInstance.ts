import axios from "axios";
import config from "../config";

const axiosInstance = axios.create({
    baseURL: config.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("Request Sent");
        return config;
    },
    (error) => {
        console.log("Request Error");
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => {
        console.log("Response Received");
        return response;
    },
    (error) => {
        console.log("Response Error");

        if (
            error.response?.status === 401 &&
            localStorage.getItem("token")
        ) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;