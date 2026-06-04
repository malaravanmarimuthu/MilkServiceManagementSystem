using Microsoft.AspNetCore.Http;
using Services.Authentication;

namespace Services.Authentication
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAuthService _authservice;
        public JwtMiddleware(RequestDelegate next, IAuthService authservice)
        {
            _next = next;
            _authservice = authservice;
        }

        public async Task Invoke(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var userId = await _authservice.ValidateJwtToken(token);
            if (userId != null)
            {
                // attach user to context on successful jwt validation
                context.Items["User"] = userId;
            }

            await _next(context);
        }
    }
}
