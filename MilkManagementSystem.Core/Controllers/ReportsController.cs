using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace MilkManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("milk-consumption")]
        public async Task<IActionResult> GetMilkConsumptionReport([FromQuery] string monthYear)
        {
            if (string.IsNullOrWhiteSpace(monthYear))
                return BadRequest("monthYear is required (format: YYYY-MM).");

            var data = await _reportService.GetMilkConsumptionReportAsync(monthYear);
            return Ok(data);
        }

        [HttpGet("procurement")]
        public async Task<IActionResult> GetProcurementReport([FromQuery] string monthYear)
        {
            if (string.IsNullOrWhiteSpace(monthYear))
                return BadRequest("monthYear is required (format: YYYY-MM).");

            var data = await _reportService.GetProcurementReportAsync(monthYear);
            return Ok(data);
        }

        [HttpGet("milk-consumption/6months")]
        public async Task<IActionResult> GetMilkConsumptionReport6Months()
        {
            var data = await _reportService.GetMilkConsumptionReport6MonthsAsync();
            return Ok(data);
        }

        [HttpGet("procurement/6months")]
        public async Task<IActionResult> GetProcurementReport6Months()
        {
            var data = await _reportService.GetProcurementReport6MonthsAsync();
            return Ok(data);
        }
    }
}