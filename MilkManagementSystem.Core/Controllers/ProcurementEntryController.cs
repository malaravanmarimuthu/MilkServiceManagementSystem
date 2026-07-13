using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

[ApiController]
[Route("api/[controller]")]
public class ProcurementEntryController : ControllerBase
{
    private readonly IProcurementEntryService _entryService;

    public ProcurementEntryController(IProcurementEntryService entryService)
    {
        _entryService = entryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var entries = await _entryService.GetAllAsync();
        return Ok(entries);
    }


    [HttpPost]
    public async Task<IActionResult> Add([FromBody] ProcurementEntryDto dto)
    {
        try
        {
            var entry = await _entryService.AddAsync(dto);
            return Ok(entry);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProcurementEntryDto dto)
    {
        try
        {
            var entry = await _entryService.UpdateAsync(dto);
            return Ok(entry);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _entryService.DeleteAsync(id);
        return Ok(new { message = "Entry deleted." });
    }
}