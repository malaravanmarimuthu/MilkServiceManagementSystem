using System;
using System.Collections.Generic;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;


namespace MilkManagement.InvoiceWebJob
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                var builder = new HostBuilder();

                builder.ConfigureAppConfiguration(config =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "AzureWebJobsStorage", "UseDevelopmentStorage=true" },
                        { "AzureWebJobsDashboard", "UseDevelopmentStorage=true" }
                    });
                });

                builder.ConfigureWebJobs(b =>
                {
                    b.AddAzureStorageCoreServices();
                    b.AddTimers();
                });

                builder.ConfigureLogging(logging =>
                {
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Information);
                });

                var host = builder.Build();
                using (host)
                {
                    host.Run();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("STARTUP ERROR:");
                Console.WriteLine(ex.ToString());
                Console.ReadLine();
            }
        }
    }
}