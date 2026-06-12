export const handleApiError = (error: unknown): string => {
    if (error && typeof error === "object" && "response" in error) {
        const err = error as {
            response?: {
                status: number;
                data?: { message?: string };
            };
        };

        const status = err.response?.status;
        const serverMessage = err.response?.data?.message;

        console.log(serverMessage);
        if (serverMessage) return serverMessage;

        switch (status) {
            case 400: return "Bad request. Please check your input.";
            case 401: return "Unauthorized. Please login again.";
            case 403: return "You don't have permission to do this.";
            case 404: return "Requested resource not found.";
            case 409: return "This record already exists.";
            case 500: return "Server error. Please try again later.";
            
        }
    }
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
};