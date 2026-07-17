using Azure.Storage.Queues;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class QueueService
    {
        private readonly QueueClient _queueClient;

        public QueueService(IConfiguration configuration)
        {
            string connectionString = configuration["AzureWebJobsStorage"];

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new Exception("AzureWebJobsStorage not found in appsettings.json");
            }

            _queueClient = new QueueClient(connectionString, "milkconsumption");

            _queueClient.CreateIfNotExists();
        }

        public async Task SendMessageAsync(object obj)
        {
            string json = JsonConvert.SerializeObject(obj);

            await _queueClient.SendMessageAsync(
                Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
        }
    }
}