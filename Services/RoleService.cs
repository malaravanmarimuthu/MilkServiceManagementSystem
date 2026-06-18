using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Models;
using Models.Dto;
using Services.Contracts;

namespace Services
{
    public class RoleService(
        IRepositary<Role> roleRepository,
        ILogger<RoleService> logger) : IRoleService
    {
        private readonly ILogger<RoleService> _logger = logger;
        private readonly IRepositary<Role> _roleRepository = roleRepository;

        public async ValueTask<List<Role>> GetAll()
        {
            try
            {
                _logger.LogInformation("Started -> GetAll Roles");

                var roles = await _roleRepository
                    .FindAll()
                    .ToListAsync();

                return roles;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> GetAll Roles");
            }
        }

        public async ValueTask<RoleDto?> GetById(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> GetById Role Id: {id}");

                var role = await _roleRepository
                    .FindByCondition(x => x.RoleID == id)
                    .FirstOrDefaultAsync();

                if (role == null) return null;

                return new RoleDto
                {
                    RoleId = role.RoleID,
                    RoleName = role.RoleName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> GetById Role Id: {id}");
            }
        }

        public async ValueTask<bool> Create(RoleDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Create Role: {dto.RoleName}");

                var role = new Role
                {
                    RoleName = dto.RoleName
                };

                await _roleRepository.CreateAsync(role);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Create Role: {dto.RoleName}");
            }
        }

        public async ValueTask<bool> Update(long id, RoleDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Update Role Id: {id}");

                var role = await _roleRepository
                    .FindByCondition(x => x.RoleID == id)
                    .FirstOrDefaultAsync();

                if (role == null) return false;

                role.RoleName = dto.RoleName;

                await _roleRepository.UpdateAsync(role);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Update Role Id: {id}");
            }
        }

        public async ValueTask<bool> Delete(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> Delete Role Id: {id}");

                var role = await _roleRepository
                    .FindByCondition(x => x.RoleID == id)
                    .FirstOrDefaultAsync();

                if (role == null) return false;

                await _roleRepository.DeleteAsync(role);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Delete Role Id: {id}");
            }
        }
    }
}