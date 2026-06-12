import axiosInstance from "../Interceptors/axiosInstance";

export const getLocations = async () => {
    const response = await axiosInstance.get("/api/Location");
    return response.data;
};

export const getLocationById = async (id: number) => {
    const response = await axiosInstance.get(`/api/Location/GetById/${id}`);
    return response.data;
};

export const createLocation = async (data: any) => {
    const response = await axiosInstance.post("/api/Location/Create", data);
    return response.data;
};

export const updateLocation = async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/Location/${id}`, data);
    return response.data;
};

export const deleteLocation = async (id: number) => {
    const response = await axiosInstance.delete(`/api/Location/${id}`);
    return response.data;
};