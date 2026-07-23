using Data.Entities;
using Models.Dto;
using Models.Request;

namespace Services.Contracts
{
    public interface IEmployeeService
    {
        ValueTask<List<EmployeeDto>> GetALL(string? role);
        ValueTask<bool> CreateAppUserAsync(RegisterDto req);
        ValueTask<EmployeeDto> IsValidAppUserAsync(LoginDto req);
        ValueTask<bool> IsValidUserIdandOrgIdAsync(long userId, long orgId);
        ValueTask<bool> ChangePassword(long id, string newPassword);
        ValueTask<Employee> GetById(long id);
        ValueTask<bool> Update(long id, EmployeeDto dto);
        ValueTask<bool> Delete(long id);

        //EmployeeLocationPhoto
        ValueTask<bool> UpdateLocationAsync(long id, decimal latitude, decimal longitude);
        ValueTask<string?> UploadPhotoAsync(long id, Stream fileStream, string fileName, string contentType);
        ValueTask<bool> DeleteLocationAsync(long id);
        ValueTask<bool> DeletePhotoAsync(long id);

    }
}