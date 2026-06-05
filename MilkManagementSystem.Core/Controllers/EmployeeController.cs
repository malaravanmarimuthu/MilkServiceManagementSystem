using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models.Dto;
using Services;
using Services.Contracts;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly ILogger<EmployeeController> _logger;
        private readonly string _Name = nameof(EmployeeController);


        public EmployeeController(
            IEmployeeService service,
            ILogger<EmployeeController> logger)
        {
            _employeeService = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var employees = await _employeeService.GetALL(null);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving employees");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var employee = await _employeeService.GetById(id);

                if (employee == null)
                    return NotFound($"Employee with ID {id} not found.");

                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error occurred while retrieving employee with ID {EmployeeId}",
                    id);

                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create (RegisterDto dto)
        {
            try
            {
               var id = await _employeeService.CreateAppUserAsync( dto);

                if (id)
                    return BadRequest("Employee creation failed.");

                return Ok(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating employee");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        // UPDATE
        [HttpPut]
        public async Task<IActionResult> Update(EmployeeDto dto)
        {
            try
            {
                var result = await _employeeService.Update(dto.ID, dto);

                if (!result)
                    return NotFound($"Employee with ID {dto.ID} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error occurred while updating employee with ID {EmployeeId}",
                    dto.ID);

                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var result = await _employeeService.Delete(id);

                if (!result)
                    return NotFound($"Employee with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error occurred while deleting employee with ID {EmployeeId}",
                    id);

                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}