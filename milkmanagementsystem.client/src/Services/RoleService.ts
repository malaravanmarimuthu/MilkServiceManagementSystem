import axiosInstance from "../Interceptors/axiosInstance";

export const getRoles = async () => {
    const response = await axiosInstance.get("/api/Role");
    return response.data;
};

export const getRoleById = async (id: number) => {
    const response = await axiosInstance.get(`/api/Role/GetById/${id}`);
    return response.data;
};

export const createRole = async (data: any) => {
    const response = await axiosInstance.post("/api/Role/Create", data);
    return response.data;
};

export const updateRole = async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/Role/${id}`, data);
    return response.data;
};

export const deleteRole = async (id: number) => {
    const response = await axiosInstance.delete(`/api/Role/${id}`);
    return response.data;
};