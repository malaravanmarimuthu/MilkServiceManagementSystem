using Data.Base;
using Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Data
{
    public static class DataDIConfig
    {
        public static DbContextOptionsBuilder ExtDbContextOptions(this DbContextOptionsBuilder options,IConfiguration configuration)
        {
            return options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
                ServerVersion.AutoDetect(configuration.GetConnectionString("DefaultConnection")));
        }

        public static void AddDbContext(IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AuthDbContext>(options =>
            {
                options.ExtDbContextOptions(configuration);
            });
        }

        public static void AddDALServices(IServiceCollection services)
        {
            services.AddScoped(typeof(IRepositary<>), typeof(Repository<>));

        }
    }
}
