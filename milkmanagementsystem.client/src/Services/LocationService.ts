    import axiosInstance from "../Interceptors/axiosInstance";

    export interface LocationType {
        locationID: number;
        locationName: string;
        street: string;
        pinCode: string;
    }

    export interface CreateLocationDto {
        locationName: string;
        street: string;
        pinCode: string;
    }

    export const getLocations = async () => {
        const response = await axiosInstance.get<LocationType[]>("/api/Location");
        return response.data;
    };

    export const createLocation = async (data: CreateLocationDto) => {
        const response = await axiosInstance.post("/api/Location/Create", data);
        return response.data;
    };

    export const updateLocation = async (
        id: number,
        data: CreateLocationDto
    ) => {
        const response = await axiosInstance.put(`/api/Location/${id}`, data);
        return response.data;
    };

    export const deleteLocation = async (id: number) => {
        const response = await axiosInstance.delete(`/api/Location/${id}`);
        return response.data;
    };