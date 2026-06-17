export interface RegisterErrors {
    firstName?: string;
    lastName?: string;
    emailId?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
}

export interface RegisterFormData {
    firstName: string;
    lastName: string;
    emailId: string;
    mobile: string;
    password: string;
    confirmPassword: string;
}

export const validateRegisterForm = (data: RegisterFormData): RegisterErrors => {
    const errors: RegisterErrors = {};

    if (!data.firstName)
        errors.firstName = "First Name is required";

    if (!data.lastName)
        errors.lastName = "Last Name is required";

    if (!data.emailId)
        errors.emailId = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.emailId))
        errors.emailId = "Email is invalid";

    if (!data.mobile)
        errors.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(data.mobile))
        errors.mobile = "Mobile must be 10 digits";

    if (!data.password)
        errors.password = "Password is required";
    else if (data.password.length < 6)
        errors.password = "Password must be at least 6 characters";

    if (!data.confirmPassword)
        errors.confirmPassword = "Confirm Password is required";
    else if (data.password !== data.confirmPassword)
        errors.confirmPassword = "Passwords do not match";

    return errors;
};

export interface LoginErrors {
    mobile?: string;
    password?: string;
}

export interface LoginFormData {
    mobile: string;
    password: string;
}

export const validateLoginForm = (data: LoginFormData): LoginErrors => {
    const errors: LoginErrors = {};

    if (!data.mobile)
        errors.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(data.mobile))
        errors.mobile = "Mobile must be 10 digits";

    if (!data.password)
        errors.password = "Password is required";

    return errors;
};