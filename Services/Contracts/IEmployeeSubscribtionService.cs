using Models.Dto;

namespace Services.Contracts
{
    public interface IEmployeeSubscriptionService
    {
        Task<IEnumerable<EmployeeSubscriptionDto>> GetAllAsync();

        Task<EmployeeSubscriptionDto?> GetByIdAsync(long id);

        Task<EmployeeSubscriptionDto> CreateEmployeeSubscription(
            EmployeeSubscriptionDto dto);

        Task<EmployeeSubscriptionDto?> UpdateAsync(
            long id,
            EmployeeSubscriptionDto dto);

        Task<bool> DeleteAsync(long id);
    }
}