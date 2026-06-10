import { useState } from "react";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../Interceptors/axiosInstance";

import {Link} from "react-router-dom";

type Props = {

  setIsRegister: (value: boolean) => void;

};

export default function LoginForm({

  setIsRegister

}: Props) {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const handleLogin = async () => {

    if (!username || !password) {

      setMessage("Enter username and password");

      setMessageType("danger");

      return;

    }

    try {

      const response = await axiosInstance.post(

        "/Auth/login",

        {

          username,

          password

        }

      );

        localStorage.setItem("token", response.data.data.JwtToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);


      setMessage("Login Successful");

      setMessageType("success");

      setTimeout(() => {

        navigate("/patients");

      }, 1500);

    }

    catch {

      setMessage(

        "Invalid Username or Password"

      );

      setMessageType("danger");

    }

  };

  return (

    <>

      <h1>Login</h1>

      {

        message &&

        <div className={`alert alert-${messageType}`}>

          {message}

        </div>

      }

      <input

        type="text"

        placeholder="Username"

        className="form-control mb-3"

        value={username}

        onChange={(e) =>

          setUsername(e.target.value)

        }

      />

      <div className="password-box">

        <input

          type={

            showPassword

            ? "text"

            : "password"

          }

          placeholder="Password"

          className="form-control"

          value={password}

          onChange={(e) =>

            setPassword(e.target.value)

          }

        />

        <span

          className="eye-icon"

          onClick={() =>

            setShowPassword(!showPassword)

          }

        >

          <i

            className={

              showPassword

              ? "bi bi-eye-slash-fill"

              : "bi bi-eye-fill"

            }

          />

        </span>

      </div>

      <button

        className="btn btn-primary w-100 mt-3"

        onClick={handleLogin}
      >
        Login

      </button>

      <Link to = "/" className="btn btn-outline-secondary w-100 mt-3">  Cancel  </Link>

      <p className="mt-4 text-center">

        Don't have an account?

      </p>

      <button

        className="btn btn-outline-secondary w-100"

        onClick={() =>

          setIsRegister(true)

        }
      >
        Register

      </button>

    </>
  );
}