import { useState } from "react";

import LoginForm from "../Components/LoginForm.tsx";

import RegisterForm from "../Components/RegisterForm.tsx";

import "./Login.css";

export default function Login() {

const [isRegister, setIsRegister] = useState(false);

  return (

    <div className="login-container">

      <div className="login-card">

        {

          isRegister

          ?

          <RegisterForm

            setIsRegister={setIsRegister}

          />
          :
          <LoginForm

            setIsRegister={setIsRegister}

          />

        }
      </div>
    </div>
  );
}