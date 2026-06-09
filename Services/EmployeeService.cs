using Mapster;
using Microsoft.EntityFrameworkCore;
using Models.Dto;

namespace Services
{
    public class EmployeeService(IRepositary<Employee> appUserRespository,
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

                var appUserEntity = new Employee
                {
                    FirstName = req.FirstName,
                    LastName = req.LastName,
                    Username = req.Username,
                    EmailId = req.EmailId,
                    Mobile = req.Mobile,
                    Department = req.Department,
                    Designation = req.Designation,
                    OrganizationID = req.OrgId,
                    HiEmployee = DateTime.Now,
                    CreatedDate = DateTime.Now,
                    CreatedBy = req.OrgId
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
            {
                _logger.LogInformation($"Started -> request {req.ToJson()}");

                var applicationuser = await _appUserRespository.FindByCondition(x => x.Username == req.Username && x.Status != null && x.Status != Common.Enums.EmployeeStatus.Deleted).Include(y => y.organization).FirstOrDefaultAsync();
                var appuserDto = new EmployeeDto();
                if (applicationuser != null)
                {
                    if (applicationuser.Password.Equals(req.Password, StringComparison.Ordinal))
                    {
                        appuserDto = applicationuser.ToMap<Employee, EmployeeDto>();
                        appuserDto.IsPostPaid = applicationuser.organization?.IsPostPaid;
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
                    .FindByCondition(x => x.ID == userId && x.OrgId == orgId)
                    .FirstOrDefaultAsync();

                if (applicationuser != null)
                {
                    return true;
                }

                return false;
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
                    .Select(x => new Employee
                    {
                        ID = x.ID,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        EmailId = x.EmailId,
                        Mobile = x.Mobile,
                        Department = x.Department,
                        Designation = x.Designation,
                        OrgId = x.OrgId
                    })
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
                emp.Department = dto.Department;
                emp.Designation = dto.Designation;

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