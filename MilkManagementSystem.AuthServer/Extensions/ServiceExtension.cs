using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace api_authenticationservice.Extensions
{
    public static class ServiceExtension
    {
        internal static void ExtAddDbContext(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            ServicesDIConfig.AddDbContext(serviceCollection, configuration);
        }

        internal static void ExtAddMapster(this IServiceCollection serviceCollection)
        {
            ServicesDIConfig.AddMapster(serviceCollection);
        }

        internal static void ExtAddBLServices(this IServiceCollection serviceCollection)
        {
            ServicesDIConfig.AddBLServices(serviceCollection);
        }

        internal static void ExtAddDALServices(this IServiceCollection serviceCollection)
        {
            ServicesDIConfig.AddDALServices(serviceCollection);
        }



        internal static void ExtAddSwagger(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddSwaggerGen(options =>
            {
                var version = configuration["AuthAPI:Swagger:Version"];
                options.SwaggerDoc(version, new OpenApiInfo
                {
                    Version = version,
                    Title = configuration["AuthAPI:Swagger:Title"],
                    Description = configuration["AuthAPI:Swagger:Description"]
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme.",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "bearer",
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
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
            });
        }

        /// <summary>
        /// To add the controllers related services.
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        internal static void ExtAddControllers(this IServiceCollection services, IConfiguration configuration)
        {
            Console.WriteLine("Configure Services - AddController Service & API Behavior Options");
            services.AddControllers().ExtConfigureApiBehaviorOptions(configuration);
        }

        /// <summary>
        /// To configure Api Behavior.
        /// </summary>
        /// <param name="mvcBuilder"></param>
        /// <param name="configuration"></param>
        internal static IMvcBuilder ExtConfigureApiBehaviorOptions(this IMvcBuilder mvcBuilder, IConfiguration configuration)
        {
            Console.WriteLine("Configure Services - Configuring ApiBehaviorOptions");
            mvcBuilder.ConfigureApiBehaviorOptions(options =>
            {
                options.ConfigureExtInvalidModelStateResponseFactory(configuration);
            });
            return mvcBuilder;
        }

        internal static void ExtAddAuthentication(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddCookie(IdentityConstants.ApplicationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = false,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["AuthAPI:AuthSettings:Issuer"],
                        ValidAudience = configuration["AuthAPI:AuthSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["AuthAPI:AuthSettings:Secret"])),
                    };
                });
        }

    }
}
