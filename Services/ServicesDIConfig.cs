using Common.Base;
using Common.Helper;
using Common.RestClient;
using Data;
using Mapster;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services.Authentication;
using Services.Mappings;

namespace Services
{
    public static class ServicesDIConfig
    {
        public static void AddDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            DataDIConfig.AddDbContext(services, configuration);
        }

        public static void AddMapster(this IServiceCollection services)
        {
            services.AddMapster();
            RegisterMapper.RegisterMapsterConfiguration();
        }

        public static void AddBLServices(this IServiceCollection services)
        {
            // configure other Service DI
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IContextResolver, ContextResolver>();
            services.AddSingleton<IAppAuthHelper, AppAuthHelper>();

            services.AddScoped<IRestAPIClient, RestAPIClient>();

            services.AddScoped<IEmployeeService, EmployeeService>();
            services.AddScoped(typeof(IApiMessage<>), typeof(ApiMessage<>));
            
        }

        public static void AddDALServices(this IServiceCollection services)
        {
            DataDIConfig.AddDALServices(services);
        }
    }
}
