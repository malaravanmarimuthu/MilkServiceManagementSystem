using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AzureMilkConsumption.WebJob
{
    class Program
    {
        static void Main()
        {
            IConfiguration configuration =
                new ConfigurationBuilder()
                .SetBasePath(System.AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            DbHelper.Configure(configuration);

            var host = new HostBuilder()
                .ConfigureAppConfiguration((context, config) =>
                {
                    config.AddConfiguration(configuration);
                })
                .ConfigureWebJobs(b =>
                {
                    b.AddAzureStorageCoreServices();
                    b.AddAzureStorageQueues();
                })
                .ConfigureLogging((context, logging) =>
                {
                    logging.AddConsole();
                })
                .Build();

            host.Run();
        }
    }
}