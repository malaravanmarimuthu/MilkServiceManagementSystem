using api_authenticationservice.Extensions;
using api_truckcompanyservice.HubDataService;
using Common.Extension;
using Common.Settings;
using Microsoft.Extensions.DependencyInjection;
namespace api_authenticationservice
{
    public static class ConnectorExtensions
    {

        public static void ExtAddConfigureServices_MilkAPI(this IServiceCollection Services, IConfiguration Configuration, string pwd, bool isAddController = false, bool isAddAuth = false, bool isAddSwagger = false)
        {
            if (!pwd.IsEqual(Configuration["Auth:ConnectorPWD"]))
                return;

            Services.ExtAddConfigureServices(Configuration, isAddController, isAddAuth, isAddSwagger);
        }

        internal static void ExtAddConfigureServices(this IServiceCollection Services, IConfiguration Configuration, bool isAddController = false, bool isAddAuth = false, bool isAddSwagger = false)
        {

            //Services.Configure<AuthSettings >(Configuration.GetSection("AuthAPI:AuthSettings"));
            //Services.Configure<ClientSecretsConfig>(Configuration.GetSection("AuthAPI:ClientSecrets"));

            //SMTP library config DI
            var authSettings = Configuration.GetSection("AuthAPI:AuthSettings").Get<AuthSettings>();
            Services.AddSingleton<IAuthSettings>(authSettings);
            

            Services.AddSingleton<SharedDb>();

            // Add services to the container.
            if (isAddController)
                Services.ExtAddControllers(Configuration);
            //if (isAddAuth)
            //    Services.ExtAddAuthentication(Configuration);
            if (isAddSwagger)
                Services.ExtAddSwagger(Configuration);

            Services.ExtAddDbContext(Configuration);
            Services.ExtAddMapster();
            Services.ExtAddBLServices();
            Services.ExtAddDALServices();
        }

        public static void ExtUseConfigureMiddleware_MilkAPI(this IApplicationBuilder app, IConfiguration Configuration, string pwd, bool isUseException = false, bool isUseSwagger = false)
        {
            if (!pwd.IsEqual(Configuration["ConnectorPWD"]))
                return;


            app.ExtUseConfigureMiddleware(Configuration, isUseException, isUseSwagger);

        }

        internal static void ExtUseConfigureMiddleware(this IApplicationBuilder app, IConfiguration Configuration, bool isUseException = false, bool isUseSwagger = false)
        {

            // Configure the HTTP request pipeline.
            // Moved configure middleware logic into extension method.
            if (isUseException)
                app.UseExtExceptionHandlerAndStatusCodePages(Configuration);

            if (isUseSwagger)
                app.UseExtSwaggerUI(Configuration);
        }
    }
}
