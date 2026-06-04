using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace api_autenticationservice.Filters;

public class AuthSecurityOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context != null && operation != null)
        {
            // AuthenticationSchemes map to scopes
            // for class level authentication schemes
            var classScope = context.MethodInfo.DeclaringType
                    .GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>()
                    .Any();

            //  for method level authentication scheme
            var methodScope = context.MethodInfo
                    .GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>()
                    .Any();

            bool requireAuth = false;
            string id = string.Empty;

            if (classScope || methodScope)
            {
                requireAuth = true;
                id = "Bearer";
            }

            if (requireAuth && !string.IsNullOrEmpty(id))
            {
                operation.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
            }
        }
    }
}

