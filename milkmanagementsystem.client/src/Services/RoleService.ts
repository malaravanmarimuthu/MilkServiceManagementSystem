import axiosInstance from "../Interceptors/axiosInstance";

export interface Role {
    roleID?: number;
    roleName: string;
}

const RoleService = {
    getAll: () => axiosInstance.get<Role[]>("/api/Role"),
    getById: (id: number) => axiosInstance.get<Role>(`/api/Role/GetById/${id}`),
    create: (data: Role) => axiosInstance.post("/api/Role/Create", data),
    update: (id: number, data: Role) => axiosInstance.put(`/api/Role/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/api/Role/${id}`),
};

export default RoleService;