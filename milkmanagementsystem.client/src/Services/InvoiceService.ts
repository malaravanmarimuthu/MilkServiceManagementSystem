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
    fromDate: string;
    toDate: string;
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
    monthYear?: string;
    fromDate?: string;
    toDate?: string;
    previousArrears: number;
    notes?: string;
}

export interface BulkInvoiceResult {
    successCount: number;
    skippedCount: number;
    failedCount: number;
    errors: string[];
}

export interface PaymentEntryDto {
    paymentID: number;
    invoiceID: number;
    amount: number;
    paidDate: string;
}

export interface AddPaymentRequest {
    amount: number;
    paidDate?: string;
}

export interface UpdatePaymentEntryRequest {
    amount: number;
    paidDate?: string;
}

export interface UpdateArrearsRequest {
    previousArrears: number;
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

    // payment history
    getPayments: (invoiceId: number) =>
        axios.get<PaymentEntryDto[]>(`${BASE}/${invoiceId}/payments`).then(r => r.data),

    addPayment: (invoiceId: number, req: AddPaymentRequest) =>
        axios.post<InvoiceDto>(`${BASE}/${invoiceId}/payments`, req).then(r => r.data),

    updatePaymentEntry: (paymentId: number, req: UpdatePaymentEntryRequest) =>
        axios.put<InvoiceDto>(`${BASE}/payments/${paymentId}`, req).then(r => r.data),

    deletePaymentEntry: (paymentId: number) =>
        axios.delete<InvoiceDto>(`${BASE}/payments/${paymentId}`).then(r => r.data),

    // arrears
    updateArrears: (invoiceId: number, req: UpdateArrearsRequest) =>
        axios.put<InvoiceDto>(`${BASE}/${invoiceId}/arrears`, req).then(r => r.data),

};