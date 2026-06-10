import { useState } from "react";

import axiosInstance from "../Interceptors/axiosInstance";

type Props = {

  setIsRegister: (value: boolean) => void;

};

export default function RegisterForm({

  setIsRegister

}: Props) {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const handleRegister = async () => {

    if (!username || !password) {

      setMessage("Username and Password required");

      setMessageType("danger");

      return;
    }

    try {

      await axiosInstance.post(

        "/Auth/Register",

        {

          username,

          password

        }

      );

      setMessage("Registration Successful");

      setMessageType("success");

      setUsername("");

      setPassword("");

      setTimeout(() => {

        setIsRegister(false);

      }, 1500);

    }

    catch {

      setMessage("Registration Failed");

      setMessageType("danger");

    }

  };

  return (

    <>

      <h1>Register</h1>

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

        className="btn btn-success w-100 mt-3"

        onClick={handleRegister}

      >
        Register

      </button>

      <button

        className="btn btn-danger w-100 mt-2"

        onClick={() =>

          setIsRegister(false)

        }

      >
        Cancel

      </button>
    </>
  );
}