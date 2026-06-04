using Common.Base;
using Common.BaseDto;
using Models.Response;

namespace Models.Request;

public class ClientTokenResponseDto 
{
    public string JwtToken { get; set; }
}

public class RefreshTokenDto : UserTokenResponseDto
{

}
