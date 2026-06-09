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

    const token =
      localStorage.getItem("token");

    // TOKEN ADD

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    console.log(" Request Sent");

    return config;

  },

  (error) => {

    console.log(" Request Error");

    return Promise.reject(error);

  }

);

// RESPONSE INTERCEPTOR

axiosInstance.interceptors.response.use(

  (response) => {

    console.log(" Response Received");

    return response;

  },

  (error) => {

    console.log(" Response Error");

    // TOKEN EXPIRED

    if (

      error.response?.status === 401 &&
      localStorage.getItem("token")

    ) {

      alert("Session Expired Please Login Again");

      localStorage.removeItem("token");

      window.location.href = "/login";

    }

    // DATA NOT FOUND

    else if (

      error.response?.status === 404

    ) {

      alert("Data Not Found");

    }

    // SERVER ERROR

    else if (

      error.response?.status === 500

    ) {

      alert("Internal Server Error");

    }

    // NETWORK ERROR

    else if (

      error.message === "Network Error"

    ) {

      alert("Backend Server Not Running");

    }

    // BAD REQUEST

    else if (

      error.response?.status === 400

    ) {

      alert("Bad Request");

    }

    // FORBIDDEN

    else if (

      error.response?.status === 403

    ) {

      alert("Access Denied");

    }

    else {

      console.log(error);

      alert("Something Went Wrong");

    }

    return Promise.reject(error);

  }

);

export default axiosInstance;