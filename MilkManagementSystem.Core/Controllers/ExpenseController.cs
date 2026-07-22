using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpenseController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        // Get All Expenses
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _expenseService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Add Expense
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseRequest request)
        {
            try
            {
                var result = await _expenseService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Update Expense
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExpenseRequest request)
        {
            try
            {
                var result = await _expenseService.UpdateAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Delete Expense
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _expenseService.DeleteAsync(id);

                if (!result)
                    return NotFound("Expense not found.");

                return Ok("Expense deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Get Total Expense
        [HttpGet("total")]
        public async Task<IActionResult> GetTotal(int month, int year)
        {
            try
            {
                var total = await _expenseService.GetTotalAsync(month, year);
                return Ok(total);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}