using Mapster;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Azure.Storage.Queues;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace Services
{
    public class EmployeeService(
        IRepositary<Employee> appUserRespository,
        IRepositary<Role> roleRepository,
        ILogger<EmployeeService> logger,
        QueueClient queueClient) : IEmployeeService
    {
        private readonly string _Name = nameof(EmployeeService);
        private readonly ILogger<EmployeeService> _logger = logger;
        private readonly IRepositary<Employee> _appUserRespository = appUserRespository;
        private readonly IRepositary<Role> _roleRepository = roleRepository;
        private readonly QueueClient _queueClient = queueClient;

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

                if (existingUser != null)
                {
                    if (existingUser.EmailId == req.EmailId)
                        throw new Exception("Email already registered");
                    if (existingUser.Mobile == req.Mobile)
                        throw new Exception("Mobile number already registered");
                }

                long roleId = req.RoleID;
                if (roleId <= 0)
                {
                    var customerRole = await _roleRepository
                        .FindByCondition(x => x.RoleName == "Customer")
                        .FirstOrDefaultAsync();
                    if (customerRole == null)
                        throw new Exception("Customer role not found");
                    roleId = customerRole.RoleID;
                }

                var appUserEntity = new Employee
                {
                    FirstName = req.FirstName,
                    LastName = req.LastName,
                    Password = req.Password,
                    EmailId = req.EmailId,
                    Mobile = req.Mobile,
                    LocationID = req.LocationID,
                    RoleID = roleId,
                    CreatedDate = DateTime.UtcNow,
                };

                await _appUserRespository.CreateAsync(appUserEntity);

                //send data to azure queue
                await _queueClient.CreateIfNotExistsAsync();

                var message = JsonSerializer.Serialize(new EmployeeDto
                {
                    ID = appUserEntity.ID,
                    FirstName = appUserEntity.FirstName,
                    LastName = appUserEntity.LastName,
                    EmailId = appUserEntity.EmailId,
                    Mobile = appUserEntity.Mobile,
                    LocationID = appUserEntity.LocationID,
                    RoleID = appUserEntity.RoleID
                });

                var messageBytes = System.Text.Encoding.UTF8.GetBytes(message);
                var base64Message = Convert.ToBase64String(messageBytes);
                var res = await _queueClient.SendMessageAsync(base64Message);
                _logger.LogInformation($"MessageId: {res.Value.MessageId}, Queue: {_queueClient.Uri}");

                _logger.LogInformation("Message send to Azure Storage Queue successfully");
                return true;
            }
            catch (Exception ex)
            {
                //_logger.LogError($"Error -> request {ex.Message}");
                Console.WriteLine(ex.ToString());
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

                var applicationuser = await _appUserRespository
                    .FindByCondition(x =>
                        x.Mobile == req.Mobile &&
                        x.Status != Common.Enums.EmployeeStatus.Deleted)
                    .Include(x => x.Role)
                    .FirstOrDefaultAsync();

                var appuserDto = new EmployeeDto();

                if (applicationuser != null)
                {
                    if (!string.IsNullOrEmpty(applicationuser.Password) &&
                        applicationuser.Password.Equals(req.Password, StringComparison.Ordinal))
                    {
                        appuserDto = applicationuser.ToMap<Employee, EmployeeDto>();
                        appuserDto.RoleName = applicationuser.Role?.RoleName ?? string.Empty;
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

        public async ValueTask<List<EmployeeDto>> GetALL(string? role)
        {
            try
            {
                var emp = await _appUserRespository
                    .FindAll()
                    .Include(x => x.Location)
                    .Include(x => x.Role)
                    .ToListAsync();

                var result = emp.Select(x => new EmployeeDto
                {
                    ID = x.ID,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    EmailId = x.EmailId,
                    Mobile = x.Mobile,
                    LocationID = x.LocationID,
                    LocationName = x.Location != null ? x.Location.LocationName : "",
                    RoleID = x.RoleID,
                    RoleName = x.Role != null ? x.Role.RoleName : ""
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                throw;
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
                var emp = await _appUserRespository
                    .FindByCondition(x => x.ID == id)
                    .FirstOrDefaultAsync();

                if (emp == null)
                    return false;

                emp.FirstName = dto.FirstName;
                emp.LastName = dto.LastName;
                emp.EmailId = dto.EmailId;
                emp.Mobile = dto.Mobile;
                emp.LocationID = dto.LocationID;
                emp.RoleID = dto.RoleID;

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

        //ChangePass
        public async ValueTask<bool> ChangePassword(long id, string newPassword)
        {
            var emp = await _appUserRespository
                .FindByCondition(x => x.ID == id)
                .FirstOrDefaultAsync();

            if (emp == null)
                return false;

            emp.Password = newPassword;

            await _appUserRespository.UpdateAsync(emp);

            return true;
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