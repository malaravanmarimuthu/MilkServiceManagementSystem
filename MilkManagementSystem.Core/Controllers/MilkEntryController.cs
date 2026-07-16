using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Models.Request;
using Services.Contracts;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MilkEntryController : ControllerBase
    {
        private readonly IMilkEntryService _milkEntryService;

        public MilkEntryController(IMilkEntryService milkEntryService)
        {
            _milkEntryService = milkEntryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _milkEntryService.GetAll();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var result = await _milkEntryService.GetById(id);
                if (result == null) return NotFound("Entry not found");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }       

        [HttpPost]
        public async Task<IActionResult> Create(MilkEntryDto dto)
        {
            try
            {
                var result = await _milkEntryService.Create(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, MilkEntryDto dto)
        {
            try
            {
                var result = await _milkEntryService.Update(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var result = await _milkEntryService.Delete(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("CompleteAll")]
        public async Task<IActionResult> CompleteAll(
    MilkConsumptionQueueRequest request,
    [FromServices] QueueService queueService)
        {
            await queueService.SendMessageAsync(request);

            return Ok(new
            {
                Success = true,
                Message = "Processing... Please wait."
            });
        }
    }
}