using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _svc;
        public ExpenseController(IExpenseService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());


        [HttpPost]
        public async Task<IActionResult> Create(CreateExpenseRequest req)
        {
            try { return Ok(await _svc.CreateAsync(req)); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateExpenseRequest req)
        {
            try { return Ok(await _svc.UpdateAsync(id, req)); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _svc.DeleteAsync(id);
                return deleted ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Delete failed for ExpenseID {id}: {ex}");
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpGet("total")]
        public async Task<IActionResult> GetTotal([FromQuery] string? monthYear)
        {
            try { return Ok(await _svc.GetTotalAsync(monthYear)); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
    }
}