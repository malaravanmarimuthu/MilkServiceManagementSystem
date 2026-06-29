import axiosInstance from "../Interceptors/axiosInstance";

export interface PaymentDto {
    paymentID?: number;
    employeeID: number;
    employeeName?: string;
    milkEntryID: number;
    quantity: number;
    ratePerLiter: number;
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
};