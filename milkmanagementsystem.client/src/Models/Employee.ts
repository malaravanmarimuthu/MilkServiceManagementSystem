export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    emailId: string;
    mobile: string;
    password: string;
    locationID: number;
    roleID: number;

    location?: {
        locationID: number;
        locationName: string;
    };

    role?: {
        roleID: number;
        roleName: string;
    };
}