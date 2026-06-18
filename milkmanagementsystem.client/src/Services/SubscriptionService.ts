import axiosInstance from "../Interceptors/axiosInstance";

// Matches backend Entity (returned by GetAll / GetById)
export interface SubscriptionType {
    subscriptionID: number;
    milkType: string;
    quantity: number;
    pricePerLiter: number;
}

// Matches backend SubscriptionDto (used for Create / Update body - no Id)
export interface CreateSubscriptionDto {
    milkType: string;
    quantity: number;
    pricePerLiter: number;
}

export const getSubscriptions = async () => {
    const response = await axiosInstance.get<SubscriptionType[]>("/api/Subscription");
    return response.data;
};

export const createSubscription = async (data: CreateSubscriptionDto) => {
    const response = await axiosInstance.post("/api/Subscription/Create", data);
    return response.data;
};

export const updateSubscription = async (
    id: number,
    data: CreateSubscriptionDto
) => {
    const response = await axiosInstance.put(`/api/Subscription/${id}`, data);
    return response.data;
};

export const deleteSubscription = async (id: number) => {
    const response = await axiosInstance.delete(`/api/Subscription/${id}`);
    return response.data;
};