using Common.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Services.Authentication
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, Microsoft.AspNetCore.Mvc.Filters.IAuthorizationFilter
    {
        private readonly IApiMessage<IApiResponse> _apiResponse;
        public AuthorizeAttribute()
        {
            _apiResponse = new ApiMessage<IApiResponse>();
        }
        public async void OnAuthorization(AuthorizationFilterContext context)
        {
            // skip authorization if action is decorated with [AllowAnonymous] attribute
            var allowAnonymous = context.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any();
            if (allowAnonymous)
                return;


            Microsoft.Extensions.Primitives.StringValues tokens;
            context.HttpContext.Request.Headers.TryGetValue("Authorization", out tokens);
            var token = tokens.FirstOrDefault();

            if (!string.IsNullOrEmpty(token))
            {
                //For Swagger Authorize
                token = token.Replace("Bearer ", "");
                var jwtService = (IAuthService)context.HttpContext.RequestServices.GetService(typeof(IAuthService));

                try
                {
                    if (await jwtService.ValidateJwtToken(token))
                        return;
                    else
                    {
                        context.Result = _apiResponse.Unauthorized("Token is invalid");
                    }
                }
                catch (SecurityTokenMalformedException exception)
                {
                    context.Result = _apiResponse.Unauthorized("Token is invalid");
                }
                catch (SecurityTokenException exception)
                {
                    context.Result = _apiResponse.Unauthorized(exception.Message);
                }
                catch (Exception ex)
                {
                    context.Result = _apiResponse.Unauthorized("Token is expired");
                }
            }
            else
            {
                context.Result = _apiResponse.Unauthorized("Authentication Token is missing");
            }
        }
    }
}
