using System.Threading.Tasks;
using Common.Queue;
using Microsoft.AspNetCore.Mvc;
using MilkManagementSystem.Models;

namespace MilkManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MilkConsumptionController : ControllerBase
    {
        private readonly IJobQueueService _queue;

        public MilkConsumptionController(IJobQueueService queue /*, other DI */)
        {
            _queue = queue;
        }

        [HttpPost("complete-all")]
        public async Task<IActionResult> CompleteAll([FromBody] CompleteAllRequest request)
        {
            var job = new ProcessingJob
            {
                Date = request.Date,
                LocationId = request.LocationId
            };

            await _queue.EnqueueAsync(job);

            return Ok(new { jobId = job.JobId, status = job.Status });
        }

        [HttpGet("job-status/{jobId}")]
        public async Task<IActionResult> GetJobStatus(string jobId)
        {
            var job = await _queue.GetStatusAsync(jobId);
            if (job == null) return NotFound();

            return Ok(new { jobId = job.JobId, status = job.Status, resultMessage = job.ResultMessage });
        }
    }
}