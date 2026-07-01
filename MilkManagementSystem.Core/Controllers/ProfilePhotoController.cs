using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ProfilePhotoController : ControllerBase
{
    private readonly IProfilePhotoService _photoService;

    public ProfilePhotoController(IProfilePhotoService photoService)
    {
        _photoService = photoService;
    }

    private int GetCurrentUserId()
    {
        var authHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            throw new UnauthorizedAccessException("Missing or invalid Authorization header.");

        var token = authHeader.Substring("Bearer ".Length).Trim();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "userid")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("userid claim not found in token.");

        return userId;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File size must be under 5MB." });

        try
        {
            var employeeId = GetCurrentUserId();
            var url = await _photoService.UploadAsync(employeeId, file);
            return Ok(new { url });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMyPhoto()
    {
        try
        {
            var employeeId = GetCurrentUserId();
            var url = await _photoService.GetPhotoUrlAsync(employeeId);
            return Ok(new { url });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "Failed to get photo." });
        }
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMyPhoto()
    {
        try
        {
            var employeeId = GetCurrentUserId();
            await _photoService.DeleteAsync(employeeId);
            return Ok(new { message = "Photo deleted." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "Delete failed." });
        }
    }
}