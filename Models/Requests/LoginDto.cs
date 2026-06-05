using Common.BaseDto;

namespace Models.Request;

public class LoginDto
{
    public string Username { get; set; }
    public string Password { get; set; }
    public long PhoneNumber{ get; set; }
}
