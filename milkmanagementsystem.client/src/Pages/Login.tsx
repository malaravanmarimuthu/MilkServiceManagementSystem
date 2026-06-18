import { useState } from "react";
import LoginForm from "../Components/LoginForm.tsx";
import RegisterForm from "../Components/RegisterForm.tsx";

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);

    if (isRegister) {
        return <RegisterForm setIsRegister={setIsRegister} />;
    }

    return <LoginForm setIsRegister={setIsRegister} />;
}