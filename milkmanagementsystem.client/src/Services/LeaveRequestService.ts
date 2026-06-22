import axiosInstance from "../Interceptors/axiosInstance";

export interface LeaveRequestDto {
    leaveRequestID: number;
    employeeID: number;
    employeeName?: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status?: string;
}

const BASE_URL = "/api/LeaveRequest";

export const LeaveRequestService = {
    getAll: async (): Promise<LeaveRequestDto[]> => {
        const res = await axiosInstance.get(BASE_URL);
        return res.data;
    },

    create: async (dto: LeaveRequestDto): Promise<boolean> => {
        const res = await axiosInstance.post(BASE_URL, dto);
        return res.data;
    },

    update: async (id: number, dto: LeaveRequestDto): Promise<boolean> => {
        const res = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
        return res.data;
    },

    delete: async (id: number): Promise<boolean> => {
        const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
        return res.data;
    },
};