using Models.Dto;
using Models.Response;
using System.Security.Claims;

namespace Services.Authentication
{
    public interface IAuthService
    {
        ValueTask<ClientTokenResponseDto> CreateAppTokenAsync(ClientTokenRequestDto req);
        ValueTask<UserTokenResponseDto> CreateUserTokenAsync(LoginDto req);
        ValueTask<RefreshTokenDto> RefreshTokenAsync(string refreshToken);

        ValueTask<SuccessDto> RegisterMemberAsync(RegisterDto registerDto);
        ValueTask<string> GenerateAccessToken(List<Claim> claims,string secret);
        ValueTask<string>  GenerateRefreshToken(List<Claim> claims);
        ValueTask<ClaimsPrincipal> GetPrincipalFromExpiredToken(string token);
        ValueTask<bool> ValidateJwtToken(string token);
    }
}
