/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import config from "../config";

export interface InvoiceDto {
    invoiceID: number;
    invoiceNumber: string;
    employeeID: number;
    employeeName: string;
    generatedDate: string;
    monthYear: string;
    totalQuantity: number;
    ratePerLitre: number;
    totalAmount: number;
    previousArrears: number;
    amountPaid: number;
    balanceDue: number;
    status: string;
    notes?: string;
    lastMonthQuantity: number;
    lastMonthAmount: number;
}

export interface CreateInvoiceRequest {
    employeeID: number;
    monthYear: string;
    previousArrears: number;
    notes?: string;
}

export interface BulkInvoiceResult {
    successCount: number;
    skippedCount: number;
    failedCount: number;
    errors: string[];
}

const BASE = `${config.AUTH_URL}/api/Invoice`;

export const InvoiceService = {

    getAll: () => axios.get<InvoiceDto[]>(BASE).then(r => r.data),

    getById: (id: number) => axios.get<InvoiceDto>(`${BASE}/${id}`).then(r => r.data),

    getByEmployee: (empId: number) => axios.get<InvoiceDto[]>(`${BASE}/employee/${empId}`).then(r => r.data),

    create: (req: CreateInvoiceRequest) => axios.post<InvoiceDto>(BASE, req).then(r => r.data),

    generateAll: (monthYear: string) =>
        axios.post<BulkInvoiceResult>(`${BASE}/generate-all`, { monthYear }).then(r => r.data),

    delete: (id: number) => axios.delete(`${BASE}/${id}`),

    getLastBalance: (empId: number) => axios.get<number>(`${BASE}/lastbalance/${empId}`).then(r => r.data),

};