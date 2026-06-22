using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

[Route("api/[controller]")]
[ApiController]
public class LeaveRequestController : ControllerBase
{
    private readonly ILeaveRequestService _leaveRequestService;

    public LeaveRequestController(
        ILeaveRequestService leaveRequestService)
    {
        _leaveRequestService = leaveRequestService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _leaveRequestService.GetAll());
    }

    [HttpPost]
    public async Task<IActionResult> Create(LeaveRequestDto dto)
    {
        return Ok(await _leaveRequestService.Create(dto));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, LeaveRequestDto dto)
    {
        var result = await _leaveRequestService.Update(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        return Ok(await _leaveRequestService.Delete(id));
    }
}