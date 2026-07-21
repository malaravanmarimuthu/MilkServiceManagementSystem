import axiosInstance from "../Interceptors/axiosInstance";

export interface MilkReportRow {
    employeeID: number;
    employeeName: string;
    locationID: number;
    locationName: string;
    entryDate: string;
    entryType: string;
    quantity: number;
    totalAmount: number;
}

export interface ProcurementReportRow {
    employeeID: number;
    employeeName: string;
    locationID: number;
    locationName: string;
    entryDate: string;
    milkType: string;
    quantity: number;
    rate: number;
    totalAmount: number;
}

export const ReportsService = {
    getMilkSalesReport: async (mode: "month" | "6months", monthYear?: string): Promise<MilkReportRow[]> => {
        const qs = mode === "month" ? `mode=month&monthYear=${monthYear}` : `mode=6months`;
        const res = await axiosInstance.get(`/api/reports/milk-sales?${qs}`);
        return res.data;
    },

    getProcurementReport: async (mode: "month" | "6months", monthYear?: string): Promise<ProcurementReportRow[]> => {
        const qs = mode === "month" ? `mode=month&monthYear=${monthYear}` : `mode=6months`;
        const res = await axiosInstance.get(`/api/reports/procurement?${qs}`);
        return res.data;
    },
};