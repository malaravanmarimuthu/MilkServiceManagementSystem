import axiosInstance from "../Interceptors/axiosInstance";

export interface EmployeeSubscriptionType {
    employeeSubscriptionId: number;
    employeeId: number;
    subscriptionId: number;
    status: string;
}

export interface CreateEmployeeSubscriptionDto {
    employeeId: number;
    subscriptionId: number;
    status: string;
}

export const getEmployeeSubscriptions = async () => {
    const response = await axiosInstance.get<EmployeeSubscriptionType[]>(
        "/api/EmployeeSubscription/GetAll"
    );
    return response.data;
};

export const createEmployeeSubscription = async (
    data: CreateEmployeeSubscriptionDto
) => {
    const response = await axiosInstance.post(
        "/api/EmployeeSubscription/Create",
        data
    );
    return response.data;
};

export const updateEmployeeSubscription = async (
    id: number,
    data: CreateEmployeeSubscriptionDto
) => {
    const response = await axiosInstance.put(
        `/api/EmployeeSubscription/${id}`,
        data
    );
    return response.data;
};

export const deleteEmployeeSubscription = async (id: number) => {
    const response = await axiosInstance.delete(
        `/api/EmployeeSubscription/${id}`
    );
    return response.data;
};