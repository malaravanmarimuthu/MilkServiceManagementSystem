/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../Interceptors/axiosInstance";

const API = "/api/Employee";

export const getEmployees = () => axiosInstance.get(API);

export const getEmployeeById = (id: number) => axiosInstance.get(`${API}/${id}`);

export const addEmployee = (data: any) => axiosInstance.post(API, data);

export const updateEmployee = (id: number, data: any) => axiosInstance.put(`${API}/${id}`, data);

export const deleteEmployee = (id: number) => axiosInstance.delete(`${API}/${id}`);