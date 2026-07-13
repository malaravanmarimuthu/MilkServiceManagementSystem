using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

[ApiController]
[Route("api/[controller]")]
public class ProcurementRateController : ControllerBase
{
    private readonly IProcurementRateService _rateService;

    public ProcurementRateController(IProcurementRateService rateService)
    {
        _rateService = rateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var rates = await _rateService.GetAllAsync();
        return Ok(rates);
    }


    [HttpPost]
    public async Task<IActionResult> Add([FromBody] ProcurementRateDto dto)
    {
        try
        {
            var rate = await _rateService.AddAsync(dto);
            return Ok(rate);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProcurementRateDto dto)
    {
        try
        {
            var rate = await _rateService.UpdateAsync(dto);
            return Ok(rate);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _rateService.DeleteAsync(id);
        return Ok(new { message = "Rate deleted." });
    }
}