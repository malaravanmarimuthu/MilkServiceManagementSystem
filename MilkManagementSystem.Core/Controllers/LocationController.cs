using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models.Dto;
using Services.Contracts;

namespace API.Controllers
{
    [Route("api/Location")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly ILocationService _locationService;
        private readonly ILogger<LocationController> _logger;

        public LocationController(
            ILocationService locationService,
            ILogger<LocationController> logger)
        {
            _locationService = locationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var locations = await _locationService.GetAll();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving locations");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var location = await _locationService.GetById(id);

                if (location == null)
                    return NotFound($"Location with ID {id} not found.");

                return Ok(location);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving location with ID {LocationId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(LocationDto dto)
        {
            try
            {
                var result = await _locationService.Create(dto);

                if (!result)
                    return BadRequest("Location creation failed.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating location");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, LocationDto dto)
        {
            try
            {
                var result = await _locationService.Update(id, dto);

                if (!result)
                    return NotFound($"Location with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating location with ID {LocationId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var result = await _locationService.Delete(id);

                if (!result)
                    return NotFound($"Location with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting location with ID {LocationId}", id);
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}