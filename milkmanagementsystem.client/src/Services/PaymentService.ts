import axiosInstance from "../Interceptors/axiosInstance";

export interface PaymentDto {
    paymentID?: number;
    employeeID: number;
    employeeName?: string;
    milkEntryID?: number | null;
    invoiceID?: number | null;
    quantity?: number | null;
    ratePerLiter?: number | null;
    totalAmount: number;
    paidDate: string;
}

export const PaymentService = {
    getAll: async (): Promise<PaymentDto[]> => {
        const res = await axiosInstance.get("/api/Payment");
        return res.data;
    },
    create: async (dto: PaymentDto): Promise<PaymentDto> => {
        const res = await axiosInstance.post("/api/Payment", dto);
        return res.data;
    },
    update: async (id: number, dto: PaymentDto): Promise<PaymentDto> => {
        const res = await axiosInstance.put(`/api/Payment/${id}`, dto);
        return res.data;
    },
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/api/Payment/${id}`);
    },
};