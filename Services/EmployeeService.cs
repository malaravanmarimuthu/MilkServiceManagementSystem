using Mapster;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Models.Request;

namespace Services
{
    public class EmployeeService(
        IRepositary<Employee> appUserRespository,
        ILogger<EmployeeService> logger) : IEmployeeService
    {
        private readonly string _Name = nameof(EmployeeService);
        private readonly ILogger<EmployeeService> _logger = logger;
        private readonly IRepositary<Employee> _appUserRespository = appUserRespository;

        public async ValueTask<bool> CreateAppUserAsync(RegisterDto req)
        {
            try
            {
                _logger.LogInformation($"Started -> request {req.ToJson()}");

                var existingUser = await _appUserRespository
                    .FindByCondition(x =>
                        x.EmailId == req.EmailId ||
                        x.Mobile == req.Mobile)
                    .FirstOrDefaultAsync();
               .FirstOrDefaultAsync();

                if (existingUser != null)
                    if (existingUser.Username == req.Username)
                        throw new Exception("Username already taken");

                    if (existingUser.EmailId == req.EmailId)
                        throw new Exception("Email already registered");

                    if (existingUser.Mobile == req.Mobile)
                        throw new Exception("Mobile number already registered");
                }

                var appUserEntity = new Employee
                {
                    FirstName = req.FirstName,
                    LastName = req.LastName,
                    Password = req.Password,
                    EmailId = req.EmailId,
                    Mobile = req.Mobile,
                    LocationID = req.LocationID,
                    RoleID = req.RoleID,
                    CreatedDate = DateTime.UtcNow,
                };

                await _appUserRespository.CreateAsync(appUserEntity);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {req.ToJson()}");
            }
        }

        public async ValueTask<EmployeeDto> IsValidAppUserAsync(LoginDto req)
        {
            try
                var applicationuser = await _appUserRespository
                    .FindByCondition(x =>
                        x.Mobile == req.Mobile &&
                        x.Status != Common.Enums.EmployeeStatus.Deleted)
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Started -> request {req.ToJson()}");
                var applicationuser = await _appUserRespository.FindByCondition(x => x.Username == req.Username && x.Status != null && x.Status != Common.Enums.EmployeeStatus.Deleted).FirstOrDefaultAsync();
                var appuserDto = new EmployeeDto();

                           applicationuser.Password.Equals(req.Password, StringComparison.Ordinal))
                {
                    if (!string.IsNullOrEmpty(applicationuser.Password) &&
                        applicationuser.Password.Equals(req.Password, StringComparison.Ordinal))
                    {
                        appuserDto = applicationuser.ToMap<Employee, EmployeeDto>();
                    }
                }

                return appuserDto;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {req.ToJson()}");
            }
        }

        public async ValueTask<bool> IsValidUserIdandOrgIdAsync(long userId, long orgId)
        {
            try
            {
                _logger.LogInformation($"Started -> request {userId} {orgId}");

                var applicationuser = await _appUserRespository
                    .FindByCondition(x => x.ID == userId)
                    .FirstOrDefaultAsync();

                return applicationuser != null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request");
            }
        }

        public async ValueTask<List<Employee>> GetALL(string? role)
        {
            try
            {
                _logger.LogInformation($"Started -> request Role : {role}");

                var emp = await _appUserRespository
                    .FindAll()
                    .ToListAsync();

                return emp;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request Role : {role}");
            }
        }

        public async ValueTask<Employee> GetById(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> request Id : {id}");

                var emp = await _appUserRespository
                    .FindByCondition(x => x.ID == id)
                    .FirstOrDefaultAsync();

                return emp;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request Id : {id}");
            }
        }

        public async ValueTask<bool> Update(long id, EmployeeDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> request Id : {id}");

                var emp = await _appUserRespository
                    .FindByCondition(x => x.ID == id)
                    .FirstOrDefaultAsync();

                if (emp == null)
                    return false;

                emp.FirstName = dto.FirstName;

                emp.LastName = dto.LastName;
                emp.EmailId = dto.EmailId;
                emp.Mobile = dto.Mobile;
                await _appUserRespository.UpdateAsync(emp);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request Id : {id}");
            }
        }

        public async ValueTask<bool> Delete(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> request Id : {id}");

                var emp = await _appUserRespository
                    .FindByCondition(x => x.ID == id)
                    .FirstOrDefaultAsync();

                if (emp == null)
                    return false;

                await _appUserRespository.DeleteAsync(emp);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> request {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request Id : {id}");
            }
        }
    }
}