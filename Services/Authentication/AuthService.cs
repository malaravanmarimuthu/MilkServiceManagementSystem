using Common.Enums;
using Common.Helper;
using Common.Settings;
using Microsoft.IdentityModel.Tokens;
using Models.Dto;
using Models.Models;
using Models.Response;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace Services.Authentication
{
    public class AuthService(ILogger<AuthService> logger
        , IAuthSettings authsettings
        , IAppAuthHelper helper
        , IEmployeeService applicationUserService):IAuthService
    {
        private readonly string _Name = nameof(AuthService);
        private readonly ILogger<AuthService> _logger = logger;
        private readonly IAuthSettings _authSettings = authsettings;
        private readonly IAppAuthHelper _helper = helper;
        private readonly IEmployeeService _applicationUserService = applicationUserService;

        public async ValueTask<ClientTokenResponseDto> CreateAppTokenAsync(ClientTokenRequestDto req)
        {
            try
            {
                _logger.LogInformation($"Started -> request {req.ToJson()}");
                bool? isFound = _authSettings.ClientSecrets?.Any(c => req.ClientKey.ToLower() == c.Key.ToLower());

                if (isFound.HasValue && isFound.Value)
                {
                    var client = _authSettings.ClientSecrets?.FirstOrDefault(c => req.ClientKey.ToLower() == c.Key.ToLower());
                    var claims = new List<Claim>{
                                new Claim("client", client.Key),
                                new Claim("type", "client"),
                     };
                    var token = await GenerateAccessToken(claims, client.Secret);
                    var appToken = await ValueTask.FromResult(new ClientTokenResponseDto()
                    {
                        JwtToken = token,
                    });
                    return appToken;
                }
                else
                {
                    _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, "Not a valid Client key");
                    throw new InvalidDataException("Not a valid Client key");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, ex.Message);
                throw ex;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {req.ToJson()}");
            }
        }

        public async ValueTask<RefreshTokenDto> RefreshTokenAsync(string req)
        {
            try
            {
                _logger.LogInformation($"Started -> request {req.ToJson()}");

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = string.Empty;
                SecurityToken decodetoken = tokenHandler.ReadToken(req);
                var jwtSecurityDecodeToken = (JwtSecurityToken)decodetoken;
                // Convert the JwtPayload to a JSON string
                string payloadJson = jwtSecurityDecodeToken.Payload.SerializeToJson();

                var claims = new List<Claim>();
                var userTokenPayload = new UserToken();

                if (jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value.ToLower() == "refresh")
                {
                    // Deserialize the JSON string to your custom object
                    userTokenPayload = JsonConvert.DeserializeObject<UserToken>(payloadJson);
                    key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(userTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
                    claims.Add(new Claim("userid", userTokenPayload.UserId));
                    claims.Add(new Claim("orgid", userTokenPayload.OrgId));
                    claims.Add(new Claim("roleid", userTokenPayload.RoleId));
                    claims.Add(new Claim("firstname", userTokenPayload.FirstName));
                    claims.Add(new Claim("username", userTokenPayload.UserName));
                    claims.Add(new Claim("rgcode", userTokenPayload.RgCode));
                }
                else
                {
                    _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, "Invalid Token. Kindly provide a refresh token");
                    throw new InvalidDataException("Invalid Token.kindly provide a refresh token");
                }

                var isValid = await _applicationUserService.IsValidUserIdandOrgIdAsync(Convert.ToInt64(userTokenPayload.UserId), Convert.ToInt64(userTokenPayload.OrgId));

                if (isValid)
                {
                    var token = await GenerateUserAccessToken(claims, _helper.GetAuthToken());
                    var refreshToken = await GenerateRefreshToken(claims);

                    var appToken = await ValueTask.FromResult(new RefreshTokenDto()
                    {
                        JwtToken = token,
                        RefreshToken = refreshToken
                    });

                    return appToken;
                }
                else
                {
                    _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, "Invalid User id or OrgId");
                    throw new InvalidDataException("Invalid Token. Kindly provide a refresh token");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, ex.Message);
                throw ex;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {req.ToJson()}");
            }
        }


        public async ValueTask<SuccessDto> RegisterMemberAsync(RegisterDto registerDto)
        {
            try
            {
                _logger.LogInformation($"Started -> request {registerDto.ToJson()}");
                var response = await _applicationUserService.CreateAppUserAsync(registerDto);

                var responseDto = await ValueTask.FromResult(new SuccessDto()
                {
                    Message = response.ToString()
                });

                return responseDto;

            }
            catch (Exception ex)
            {
                _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, ex.Message);
                throw ex;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {registerDto.ToJson()}");
            }
        }

        public async ValueTask<UserTokenResponseDto> CreateUserTokenAsync(LoginDto req)
        {
            try
            {
                _logger.LogInformation($"Started -> request {req.ToJson()}");

                var user = await _applicationUserService.IsValidAppUserAsync(req);

                if (user == null || user.ID == 0)
                {
                    _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, "Invalid credentials");
                    throw new InvalidDataException("Invalid username or password");
                }

                var claims = new List<Claim>
{
    new Claim("userid", user.ID.ToString()),
    new Claim("orgid", "0"),
    new Claim("username", user.Username ?? string.Empty),
    new Claim("firstname", user.FirstName ?? string.Empty),
    new Claim("client", "web"),
    new Claim("type", "user")
};


                var accessToken = await GenerateAccessToken(claims,
                    _authSettings.ClientSecrets
                        .FirstOrDefault(x => x.Key == "web")?.Secret
                        ?? _authSettings.Secret);

                var refreshToken = await GenerateRefreshToken(claims);

                return new UserTokenResponseDto
                {
                    JwtToken = accessToken,
                    RefreshToken = refreshToken
                };
            }
            catch (Exception ex)
            {
                _logger.LogError("{Name} - Error occurred, Exception: {Exp}", _Name, ex.Message);
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> request {req.ToJson()}");
            }
        }

        public async ValueTask<string> GenerateUserAccessToken(List<Claim> claims, string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = string.Empty;
            SecurityToken decodetoken = tokenHandler.ReadToken(token);
            var jwtSecurityDecodeToken = (JwtSecurityToken)decodetoken;
            // Convert the JwtPayload to a JSON string
            string payloadJson = jwtSecurityDecodeToken.Payload.SerializeToJson();
            var userClaims = new List<Claim>();
            userClaims.AddRange(claims);
            var tokenType = jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value;
            if (tokenType.ToLower() == "client")
            {
                // Deserialize the JSON string to your custom object
                var clientTokenPayload = JsonConvert.DeserializeObject<ClientToken>(payloadJson);
                //key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(clientTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
                userClaims.Add(new Claim("client", clientTokenPayload.Client));
                userClaims.Add(new Claim("type", "user"));
            }
            else if (tokenType.ToLower() == "user")
            {
                // Deserialize the JSON string to your custom object
                var userTokenPayload = JsonConvert.DeserializeObject<UserToken>(payloadJson);
                key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(userTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
                userClaims.Add(new Claim("client", userTokenPayload.Client));
                userClaims.Add(new Claim("type", "user"));
            }
            else if (tokenType.ToLower() == "refresh")
            {
                // Deserialize the JSON string to your custom object
                var userTokenPayload = JsonConvert.DeserializeObject<UserToken>(payloadJson);
                key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(userTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
                userClaims.Add(new Claim("client", userTokenPayload.Client));
                userClaims.Add(new Claim("type", "user"));
            }
            else
            {
                throw new SecurityTokenException("Invalid token type");
            }

            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var tokeOptions = new JwtSecurityToken(
                issuer: _authSettings.Issuer,
                audience: _authSettings.Audience,
                claims: userClaims,
                expires: DateTime.Now.AddMinutes(Convert.ToInt64(_authSettings.TokenExpiryinMins)),
                signingCredentials: signinCredentials
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
            return await ValueTask.FromResult(tokenString);
        }

        public async ValueTask<string> GenerateAccessToken(List<Claim> claims, string secret = null)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret ?? _authSettings.Secret));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var tokeOptions = new JwtSecurityToken(
                issuer: _authSettings.Issuer,
                audience: _authSettings.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToInt64(_authSettings.TokenExpiryinMins)),
                signingCredentials: signinCredentials
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
            return await ValueTask.FromResult(tokenString);
        }

        public async ValueTask<string> GenerateRefreshToken(List<Claim> claims)
        {
            var refreshClaims = new List<Claim>();
            refreshClaims.AddRange(claims);

            var clientClaim = claims.FirstOrDefault(x => x.Type == "client")?.Value ?? "web";
            refreshClaims.Add(new Claim("client", clientClaim));
            refreshClaims.Add(new Claim("type", "refresh"));

            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_authSettings.Secret));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var tokeOptions = new JwtSecurityToken(
                issuer: _authSettings.Issuer,
                audience: _authSettings.Audience,
                claims: refreshClaims,
                expires: DateTime.Now.AddMinutes(Convert.ToInt64(_authSettings.RefreshTokenExpiryinMins)),
                signingCredentials: signinCredentials
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
            return await ValueTask.FromResult(tokenString);
        }
        public async ValueTask<ClaimsPrincipal> GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false, //you might want to validate the audience and issuer depending on your use case
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_authSettings.Secret)),
                ValidateLifetime = false //here we are saying that we don't care about the token's expiration date
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
            return await ValueTask.FromResult(principal);
        }

        public async ValueTask<bool> ValidateJwtToken(string token)
        {
            if (token == null)
                return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = string.Empty;
            SecurityToken decodetoken = tokenHandler.ReadToken(token);
            var jwtSecurityDecodeToken = (JwtSecurityToken)decodetoken;
            // Convert the JwtPayload to a JSON string
            string payloadJson = jwtSecurityDecodeToken.Payload.SerializeToJson();

            if (jwtSecurityDecodeToken.Claims.FirstOrDefault(x => x.Type == "type") == null)
                throw new SecurityTokenException("Token type not found");

            if (jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value.ToLower() == "client")
            {
                // Deserialize the JSON string to your custom object
                //var clientTokenPayload = JsonSerializer.Deserialize<ClientToken>(payloadJson);

                var clientTokenPayload = JsonConvert.DeserializeObject<ClientToken>(payloadJson);

                key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(clientTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
            }
            else if (jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value.ToLower() == "user")
            {
                // Deserialize the JSON string to your custom object
                var userTokenPayload = JsonConvert.DeserializeObject<UserToken>(payloadJson);
                key = _authSettings.ClientSecrets.FirstOrDefault(x => x.Key.Equals(userTokenPayload.Client, StringComparison.CurrentCultureIgnoreCase)).Secret;
            }
            else if (jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value.ToLower() == "refresh")
            {
                key = _authSettings.Secret;
            }
            else
            {
                throw new SecurityTokenException("Invalid Token Type");
            }

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidAudience = _authSettings.Audience,
                    ValidateAudience = true, //you might want to validate the audience and issuer depending on your use case
                    ValidIssuer = _authSettings.Issuer,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateLifetime = true //here we are saying that we don't care about the token's expiration date
                };

                tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                var jwtSecurityToken = (JwtSecurityToken)validatedToken;
                if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                    throw new SecurityTokenException("Invalid token");

                // return empty when we pass the client token
                return await ValueTask.FromResult(true);
            }
            catch (SecurityTokenExpiredException ex)
            {
                throw new SecurityTokenException("Token is expired");
            }
            catch (SecurityTokenSignatureKeyNotFoundException ex)
            {
                throw new SecurityTokenException("Invalid signature key or key not found");
            }
            catch (Exception ex)
            {
                throw new SecurityTokenException(ex.Message);
            }
        }

    }
}