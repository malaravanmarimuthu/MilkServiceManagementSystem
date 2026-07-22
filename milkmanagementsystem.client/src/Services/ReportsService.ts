import axiosInstance from "../Interceptors/axiosInstance";

export interface PieChartRow {
    employeeID: number;
    employeeName: string;
    locationID: number;
    locationName: string;
    entryDate: string;
    entryType: string;
    quantity: number;
    totalAmount: number;
}

export interface BarChartRow {
    sourceType: "Procurement" | "Sales";
    employeeID: number;
    locationID: number;
    locationName: string;
    entryDate: string;
    quantity: number;
    amount: number;
}

export const ReportsService = {
    getPieChartReport: async (mode: "month" | "6months", monthYear?: string): Promise<PieChartRow[]> => {
        const qs = mode === "month" ? `mode=month&monthYear=${monthYear}` : `mode=6months`;
        const res = await axiosInstance.get(`/api/reports/pie-chart?${qs}`);
        return res.data;
    },

    getBarChartReport: async (mode: "month" | "6months", monthYear?: string): Promise<BarChartRow[]> => {
        const qs = mode === "month" ? `mode=month&monthYear=${monthYear}` : `mode=6months`;
        const res = await axiosInstance.get(`/api/reports/bar-chart?${qs}`);
        return res.data;
    },
};