using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace MilkManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        [HttpGet("pie-chart")]
        public async Task<IActionResult> GetPieChartReport([FromQuery] string mode, [FromQuery] string? monthYear)
        {
            if (mode != "month" && mode != "6months")
                return BadRequest("mode must be 'month' or '6months'.");
            if (mode == "month" && string.IsNullOrWhiteSpace(monthYear))
                return BadRequest("monthYear is required when mode='month'.");

            try
            {
                var data = await _reportService.GetPieChartReportAsync(mode, monthYear ?? "");
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetPieChartReport failed");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("bar-chart")]
        public async Task<IActionResult> GetBarChartReport([FromQuery] string mode, [FromQuery] string? monthYear)
        {
            if (mode != "month" && mode != "6months")
                return BadRequest("mode must be 'month' or '6months'.");
            if (mode == "month" && string.IsNullOrWhiteSpace(monthYear))
                return BadRequest("monthYear is required when mode='month'.");

            try
            {
                var data = await _reportService.GetBarChartReportAsync(mode, monthYear ?? "");
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetBarChartReport failed");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}