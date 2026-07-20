/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import config from "../config";

export interface ExpenseDto {
    expenseID: number;
    expenseType: string;     
    description: string;      
    amount: number;
    expenseDate: string;
    notes?: string;
    createdDate?: string;
}

export interface CreateExpenseRequest {
    expenseType: string;
    description: string;
    amount: number;
    expenseDate: string;
    notes?: string;
}

const BASE = `${config.AUTH_URL}/api/Expense`;

export const ExpenseService = {

    getAll: () => axios.get<ExpenseDto[]>(BASE).then(r => r.data),

    getById: (id: number) => axios.get<ExpenseDto>(`${BASE}/${id}`).then(r => r.data),

    create: (req: CreateExpenseRequest) => axios.post<ExpenseDto>(BASE, req).then(r => r.data),

    update: (id: number, req: CreateExpenseRequest) =>
        axios.put<ExpenseDto>(`${BASE}/${id}`, req).then(r => r.data),

    delete: (id: number) => axios.delete(`${BASE}/${id}`),

    getTotal: (monthYear?: string) =>
        axios.get<number>(`${BASE}/total`, { params: monthYear ? { monthYear } : {} }).then(r => r.data),

};