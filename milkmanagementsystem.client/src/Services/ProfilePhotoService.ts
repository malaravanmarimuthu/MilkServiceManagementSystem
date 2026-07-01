import axiosInstance from "../Interceptors/axiosInstance";

const API = "/api/ProfilePhoto";

export const uploadProfilePhoto = async (employeeId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(
        `${API}/upload/${employeeId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

export const getProfilePhotoUrl = async (employeeId: number): Promise<string | null> => {
    const res = await axiosInstance.get(`${API}/${employeeId}`);
    return res.data?.url ?? null;
};

export const deleteProfilePhoto = async (employeeId: number): Promise<void> => {
    await axiosInstance.delete(`${API}/${employeeId}`);
};