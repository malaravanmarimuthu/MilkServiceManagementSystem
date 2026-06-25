/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../Interceptors/axiosInstance";

const API = "/api/Employee";

export const getEmployees = () => axiosInstance.get(API);

export const addEmployee = (data: any) =>
    axiosInstance.post(API, {
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.emailId,
        mobile: data.mobile,
        password: data.password,
        locationID: data.locationID,
        roleID: data.roleID,
    });

export const updateEmployee = (id: number, data: any) =>
    axiosInstance.put(`${API}/${id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.emailId,
        mobile: data.mobile,
        locationID: data.locationID,
        roleID: data.roleID,
    });

export const changePassword = async (
    userId: number,
    mobile: string,
    oldPassword: string,
    newPassword: string
) => {
    return await axiosInstance.post(`/Auth/changepassword`, {
        employeeId: userId,
        mobile: mobile,
        oldPassword,
        newPassword,
    });
};

export const deleteEmployee = (id: number) =>
    axiosInstance.delete(`${API}/${id}`);

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    emailId: string;
    mobile: string;
    password: string;
    locationID: number;
    roleID: number;

    location?: {
        locationID: number;
        locationName: string;
    };

    role?: {
        roleID: number;
        roleName: string;
    };
}