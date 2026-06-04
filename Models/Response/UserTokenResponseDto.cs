namespace Models.Response;

public class UserTokenResponseDto 
{
    public string JwtToken { get; set; }

    public string RefreshToken { get; set; }
}
