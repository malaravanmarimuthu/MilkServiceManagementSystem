using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [Route("api/Role")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(
            IRoleService roleService,
            ILogger<RoleController> logger)
        {
            _roleService = roleService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roles = await _roleService.GetAll();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving roles");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var role = await _roleService.GetById(id);

                if (role == null)
                    return NotFound($"Role with ID {id} not found.");

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving role with ID {RoleId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(RoleDto dto)
        {
            try
            {
                var result = await _roleService.Create(dto);

                if (!result)
                    return BadRequest("Role creation failed.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating role");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(RoleDto dto)
        {
            try
            {
                var result = await _roleService.Update(dto.RoleId, dto);

                if (!result)
                    return NotFound($"Role with ID {dto.RoleId} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating role with ID {RoleId}", dto.RoleId);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var result = await _roleService.Delete(id);

                if (!result)
                    return NotFound($"Role with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting role with ID {RoleId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}