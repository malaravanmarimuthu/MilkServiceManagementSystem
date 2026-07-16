using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MilkManagementSystem.WebJob.Models;
using Newtonsoft.Json;
using System.Text;

namespace MilkManagementSystem.WebJob
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _configuration;
        private readonly QueueServiceClient _queueServiceClient;

        public Worker(
            ILogger<Worker> logger,
            IConfiguration configuration,
            QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _configuration = configuration;
            _queueServiceClient = queueServiceClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var queueName = _configuration["QueueSettings:QueueName"];

            var queueClient = _queueServiceClient.GetQueueClient(queueName);

            await queueClient.CreateIfNotExistsAsync();

            _logger.LogInformation("WebJob Started...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    QueueMessage[] messages =
                        (await queueClient.ReceiveMessagesAsync(maxMessages: 1)).Value;

                    if (messages.Length > 0)
                    {
                        var message = messages[0];

                        _logger.LogInformation($"Queue Message : {message.MessageText}");

                        // Base64 Decode
                        var json = Encoding.UTF8.GetString(
                            Convert.FromBase64String(message.MessageText));

                        _logger.LogInformation($"Decoded JSON : {json}");

                        var employee = JsonConvert.DeserializeObject<EmployeeQueueModel>(json);

                        if (employee != null)
                        {
                            _logger.LogInformation($"ID : {employee.ID}");
                            _logger.LogInformation($"First Name : {employee.FirstName}");
                            _logger.LogInformation($"Last Name : {employee.LastName}");
                            _logger.LogInformation($"Email : {employee.EmailId}");
                            _logger.LogInformation($"Mobile : {employee.Mobile}");
                            _logger.LogInformation($"Location ID : {employee.LocationID}");
                            _logger.LogInformation($"Role ID : {employee.RoleID}");
                        }

                        await queueClient.DeleteMessageAsync(
                            message.MessageId,
                            message.PopReceipt);

                        _logger.LogInformation("Queue Message Deleted Successfully");
                    }

                    await Task.Delay(5000, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while processing queue message");
                }
            }
        }
    }
}