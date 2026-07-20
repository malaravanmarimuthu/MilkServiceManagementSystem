import axiosInstance from "../Interceptors/axiosInstance";

export interface MilkReportRow {
    employeeID: number;
    employeeName: string;
    entryDate: string;
    entryType: string;
    quantity: number;
}

export interface ProcurementReportRow {
    employeeID: number;
    employeeName: string;
    entryDate: string;
    milkType: string;
    quantity: number;
    rate: number;
    totalAmount: number;
}

export interface MilkReportMonthlyRow {
    employeeID: number;
    employeeName: string;
    monthYear: string;
    quantity: number;
}

export interface ProcurementReportMonthlyRow {
    employeeID: number;
    employeeName: string;
    monthYear: string;
    quantity: number;
    totalAmount: number;
}

export const ReportsService = {
    getMilkConsumptionReport: async (monthYear: string): Promise<MilkReportRow[]> => {
        const res = await axiosInstance.get(`/api/reports/milk-consumption?monthYear=${monthYear}`);
        return res.data;
    },

    getProcurementReport: async (monthYear: string): Promise<ProcurementReportRow[]> => {
        const res = await axiosInstance.get(`/api/reports/procurement?monthYear=${monthYear}`);
        return res.data;
    },

    getMilkConsumptionReport6Months: async (): Promise<MilkReportMonthlyRow[]> => {
        const res = await axiosInstance.get(`/api/reports/milk-consumption/6months`);
        return res.data;
    },

    getProcurementReport6Months: async (): Promise<ProcurementReportMonthlyRow[]> => {
        const res = await axiosInstance.get(`/api/reports/procurement/6months`);
        return res.data;
    },
};