import axiosInstance from "../Interceptors/axiosInstance";

const API = "/api/ProfilePhoto";

export const uploadProfilePhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(
        `${API}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

export const getProfilePhotoUrl = async (): Promise<string | null> => {
    const res = await axiosInstance.get(`${API}/me`);
    return res.data?.url ?? null;
};

export const deleteProfilePhoto = async (): Promise<void> => {
    await axiosInstance.delete(`${API}/me`);
};