import axiosInstance from "../Interceptors/axiosInstance";

export interface ProcurementEntryDto {
    id?: number;
    employeeId: number;
    supplierName?: string;
    milkType: string;
    quantity: number;
    rate: number;
    totalAmount?: number;
    entryDate: string;
}

export const ProcurementEntryService = {
    getAll: async (): Promise<ProcurementEntryDto[]> => {
        const res = await axiosInstance.get("/api/ProcurementEntry");
        return res.data;
    },

    create: async (dto: Partial<ProcurementEntryDto>) => {
        const res = await axiosInstance.post("/api/ProcurementEntry", dto);
        return res.data;
    },

    update: async (dto: Partial<ProcurementEntryDto>) => {
        const res = await axiosInstance.put("/api/ProcurementEntry", dto);
        return res.data;
    },

    delete: async (id: number) => {
        const res = await axiosInstance.delete(`/api/ProcurementEntry/${id}`);
        return res.data;
    },
};