using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProfilePhotoController : ControllerBase
{
    private readonly IProfilePhotoService _photoService;

    public ProfilePhotoController(IProfilePhotoService photoService)
    {
        _photoService = photoService;
    }

    [HttpPost("upload/{employeeId}")]
    public async Task<IActionResult> Upload(int employeeId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File size must be under 5MB." });

        try
        {
            var url = await _photoService.UploadAsync(employeeId, file);
            return Ok(new { url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetPhoto(int employeeId)
    {
        try
        {
            var url = await _photoService.GetPhotoUrlAsync(employeeId);
            return Ok(new { url });
        }
        catch
        {
            return StatusCode(500, new { message = "Failed to get photo." });
        }
    }

    [HttpDelete("{employeeId}")]
    public async Task<IActionResult> DeletePhoto(int employeeId)
    {
        try
        {
            await _photoService.DeleteAsync(employeeId);
            return Ok(new { message = "Photo deleted." });
        }
        catch
        {
            return StatusCode(500, new { message = "Delete failed." });
        }
    }
}