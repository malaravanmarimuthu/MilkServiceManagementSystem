/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "../Interceptors/axiosInstance";

export interface MilkEntryDto {
    milkEntryID: number;
    employeeID: number;
    employeeName?: string;
    locationID: number;
    locationName?: string;
    entryDate: string;
    entryType: string;
    quantity: number;
    notes?: string;
}

const BASE = "/api/MilkEntry";

export const MilkEntryService = {
    getAll: async (): Promise<MilkEntryDto[]> => {
        const res = await axiosInstance.get(BASE);
        return res.data;
    },
    getById: async (id:number): Promise<MilkEntryDto[]> => {
        const res = await axiosInstance.get(`${BASE}/${id}`);
        return res.data;
    },
    create: async (dto: MilkEntryDto): Promise<boolean> => {
        const res = await axiosInstance.post(BASE, dto);
        return res.data;
    },
    update: async (id: number, dto: MilkEntryDto): Promise<boolean> => {
        const res = await axiosInstance.put(`${BASE}/${id}`,dto);
        return res.data;
    },
    delete: async (id: number): Promise<boolean> => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};