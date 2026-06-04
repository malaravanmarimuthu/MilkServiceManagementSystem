using Common.Extension;
using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Models.Request;
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
            IEmployeeService employeeService,
            ILogger<EmployeeController> logger)
        {
            _employeeService = employeeService;
            _logger = logger;
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create(RegisterDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> {_Name}.Create Request : {dto.ToJson()}");

                var result = await _employeeService.CreateAppUserAsync(dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {_Name}.Create : {ex.Message}");
                return BadRequest(ex.Message);
            }
            finally
            {
                _logger.LogInformation($"Completed -> {_Name}.Create Request : {dto.ToJson()}");
            }
        }

        // READ ALL
        [HttpGet]
        public async Task<IActionResult> GetALL()
        {
            try
            {
                _logger.LogInformation($"Started -> {_Name}.GetALL");

                var result = await _employeeService.GetALL(null);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {_Name}.GetALL : {ex.Message}");
                return BadRequest(ex.Message);
            }
            finally
            {
                _logger.LogInformation($"Completed -> {_Name}.GetALL");
            }
        }

        // READ BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> {_Name}.GetById Request Id : {id}");

                var result = await _employeeService.GetById(id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {_Name}.GetById : {ex.Message}");
                return BadRequest(ex.Message);
            }
            finally
            {
                _logger.LogInformation($"Completed -> {_Name}.GetById Request Id : {id}");
            }
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, EmployeeDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> {_Name}.Update Request Id : {id}");

                var result = await _employeeService.Update(id, dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {_Name}.Update : {ex.Message}");
                return BadRequest(ex.Message);
            }
            finally
            {
                _logger.LogInformation($"Completed -> {_Name}.Update Request Id : {id}");
            }
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> {_Name}.Delete Request Id : {id}");

                var result = await _employeeService.Delete(id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {_Name}.Delete : {ex.Message}");
                return BadRequest(ex.Message);
            }
            finally
            {
                _logger.LogInformation($"Completed -> {_Name}.Delete Request Id : {id}");
            }
        }
    }
}