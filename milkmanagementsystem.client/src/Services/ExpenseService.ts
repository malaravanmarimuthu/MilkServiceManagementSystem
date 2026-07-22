import axiosInstance from "../Interceptors/axiosInstance";

export interface ExpenseDto {
    expenseID: number;
    expenseType: string;
    description: string;
    amount: number;
    expenseDate: string;  
    notes?: string;
}

export interface CreateExpenseRequest {
    expenseType: string;
    description: string;
    amount: number;
    expenseDate: string;  
    notes?: string;
}

export const ExpenseService = {

    getAll: async (): Promise<ExpenseDto[]> => {
        const res = await axiosInstance.get("/api/Expense");
        return res.data;
    },

    create: async (request: CreateExpenseRequest): Promise<ExpenseDto> => {
        const res = await axiosInstance.post("/api/Expense", request);
        return res.data;
    },

    update: async (id: number, request: CreateExpenseRequest): Promise<ExpenseDto> => {
        const res = await axiosInstance.put(`/api/Expense/${id}`, request);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/api/Expense/${id}`);
    },

    getTotal: async (month: number, year: number): Promise<number> => {
        const res = await axiosInstance.get("/api/Expense/total", {
            params: { month, year }
        });
        return res.data;
    }
};