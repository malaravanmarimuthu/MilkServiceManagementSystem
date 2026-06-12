import axiosInstance from "../Interceptors/axiosInstance";

export interface LocationType {
    locationId: number;
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

export const getLocationById = async (id: number) => {
    const response = await axiosInstance.get<LocationType>(
        `/api/Location/GetById/${id}`
    );
    return response.data;
};

export const createLocation = async (data: CreateLocationDto) => {
    const response = await axiosInstance.post<LocationType>(
        "/api/Location/Create",
        data
    );
    return response.data;
};

export const updateLocation = async (id: number, data: CreateLocationDto) => {
    const response = await axiosInstance.put<LocationType>(
        `/api/Location/${id}`,
        data
    );
    return response.data;
};

export const deleteLocation = async (id: number) => {
    console.log("Deleting ID:", id); // verify id is not undefined
    await axiosInstance.delete(`/api/Location/${id}`);
};