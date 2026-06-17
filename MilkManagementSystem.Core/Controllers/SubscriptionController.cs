using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [Route("api/Subscription")]
    [ApiController]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(
            ISubscriptionService subscriptionService,
            ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var subscriptions = await _subscriptionService.GetAll();
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving subscriptions");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var subscription = await _subscriptionService.GetById(id);

                if (subscription == null)
                    return NotFound($"Subscription with ID {id} not found.");

                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving subscription with ID {SubscriptionId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(SubscriptionDto dto)
        {
            try
            {
                var result = await _subscriptionService.Create(dto);

                if (!result)
                    return BadRequest("Subscription creation failed.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating subscription");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, SubscriptionDto dto)
        {
            try
            {
                var result = await _subscriptionService.Update(id, dto);

                if (!result)
                    return NotFound($"Subscription with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating subscription with ID {SubscriptionId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var result = await _subscriptionService.Delete(id);

                if (!result)
                    return NotFound($"Subscription with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting subscription with ID {SubscriptionId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}