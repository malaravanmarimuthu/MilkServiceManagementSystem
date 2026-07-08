using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _svc;
        public InvoiceController(IInvoiceService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var r = await _svc.GetByIdAsync(id);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetByEmployee(long empId) =>
            Ok(await _svc.GetByEmployeeAsync(empId));

        [HttpPost]
        public async Task<IActionResult> Create(CreateInvoiceRequest req)
        {
            try { return Ok(await _svc.CreateAsync(req)); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("generate-all")]
        public async Task<IActionResult> CreateAll([FromBody] BulkInvoiceRequest req)
        {
            try { return Ok(await _svc.CreateAllAsync(req.MonthYear)); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var deleted = await _svc.DeleteAsync(id);
                return deleted ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Delete failed for InvoiceID {id}: {ex}");
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpGet("lastbalance/{empId}")]
        public async Task<IActionResult> GetLastBalance(long empId) =>
            Ok(await _svc.GetLastBalanceAsync(empId));
    }
}