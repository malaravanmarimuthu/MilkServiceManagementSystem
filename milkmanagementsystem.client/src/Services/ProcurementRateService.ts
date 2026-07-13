import axiosInstance from "../Interceptors/axiosInstance";

const RATE_API = "/api/ProcurementRate";

export interface ProcurementRateDto {
    id: number;
    milkType: string;
    rate: number;
}

export const getRates = async (): Promise<ProcurementRateDto[]> => {
    const res = await axiosInstance.get(RATE_API);
    return res.data;
};

export const addRate = async (dto: Omit<ProcurementRateDto, "id">) => {
    const res = await axiosInstance.post(RATE_API, { id: 0, ...dto });
    return res.data;
};

export const updateRate = async (dto: ProcurementRateDto) => {
    const res = await axiosInstance.put(RATE_API, dto);
    return res.data;
};

export const deleteRate = async (id: number) => {
    await axiosInstance.delete(`${RATE_API}/${id}`);
};