using Microsoft.Extensions.Configuration;

namespace AzureMilkConsumption.WebJob
{
    public static class DbHelper
    {
        private static IConfiguration configuration;

        public static void Configure(IConfiguration config)
        {
            configuration = config;
        }

        public static string ConnectionString
        {
            get
            {
                return configuration.GetConnectionString("DefaultConnection");
            }
        }
    }
}