using Models.Dto;
namespace Services.Contracts
{
    public interface IEmployeeService
    {
        ValueTask<List<EmployeeDto>> GetALL(string? role);
        ValueTask<bool> CreateAppUserAsync(RegisterDto req);
        ValueTask<EmployeeDto> IsValidAppUserAsync(LoginDto req);
        ValueTask<bool> IsValidUserIdandOrgIdAsync(long userId,long orgId);
        ValueTask<Employee> GetById(long id);

        ValueTask<bool> Update(long id, EmployeeDto dto);

        ValueTask<bool> Delete(long id);
    }
}
