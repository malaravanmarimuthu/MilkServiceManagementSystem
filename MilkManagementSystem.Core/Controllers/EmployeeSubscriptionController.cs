using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

namespace MilkManagementSystem.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeSubscriptionController : ControllerBase
    {
        private readonly IEmployeeSubscriptionService _service;

        public EmployeeSubscriptionController(
            IEmployeeSubscriptionService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(EmployeeSubscriptionDto dto)
        {
            try
            {
                var data = await _service.CreateEmployeeSubscription(dto);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            EmployeeSubscriptionDto dto)
        {
            try
            {
                var data = await _service.UpdateAsync(id, dto);

                if (data == null)
                    return NotFound();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok("Deleted Successfully");
        }
    }
}