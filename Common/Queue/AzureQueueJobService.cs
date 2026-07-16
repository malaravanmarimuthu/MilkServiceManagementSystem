using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using Azure.Storage.Queues;

namespace Common.Queue
{
    public class AzureQueueJobService : IJobQueueService
    {
        private readonly QueueClient _queueClient;
        private readonly TableClient _tableClient;

        public AzureQueueJobService()
        {
            string connectionString =
                "DefaultEndpointsProtocol=https;AccountName=anaiyaanlogsstorage;AccountKey=Kep9YP699Uo8BDBNUj7rjvwWLJ823Kg3PnK7N1Pyy403wixBbwC69sUdGKn2DmUXYrFvLRO9mx37+AStn+7tHg==;EndpointSuffix=core.windows.net";

            string queueName = "milkconsumption";

            _queueClient = new QueueClient(connectionString, queueName);
            _queueClient.CreateIfNotExists();

            _tableClient = new TableClient(connectionString, "MilkConsumptionJobStatus");
            _tableClient.CreateIfNotExists();
        }

        public async Task EnqueueAsync(ProcessingJob job)
        {
            await SaveStatusAsync(job);

            var json = JsonSerializer.Serialize(job);
            var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

            await _queueClient.SendMessageAsync(base64);
        }

        public async Task<QueueMessageResult> ReceiveNextAsync()
        {
            var response = await _queueClient.ReceiveMessagesAsync(
                maxMessages: 1,
                visibilityTimeout: TimeSpan.FromMinutes(5));

            var message = response.Value.FirstOrDefault();
            if (message == null)
                return null;

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(message.MessageText));
            var job = JsonSerializer.Deserialize<ProcessingJob>(json);

            return new QueueMessageResult
            {
                Job = job,
                MessageId = message.MessageId,
                PopReceipt = message.PopReceipt
            };
        }

        public async Task DeleteMessageAsync(string messageId, string popReceipt)
        {
            await _queueClient.DeleteMessageAsync(messageId, popReceipt);
        }

        public async Task CompleteJobAsync(ProcessingJob job, string status, string resultMessage)
        {
            job.Status = status;
            job.ResultMessage = resultMessage;
            await SaveStatusAsync(job);
        }

        public async Task<ProcessingJob> GetStatusAsync(string jobId)
        {
            try
            {
                var entity = await _tableClient.GetEntityAsync<JobStatusEntity>("Job", jobId);

                return new ProcessingJob
                {
                    JobId = jobId,
                    Status = entity.Value.Status,
                    Date = entity.Value.Date,
                    LocationId = entity.Value.LocationId,
                    ResultMessage = entity.Value.ResultMessage
                };
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        private async Task SaveStatusAsync(ProcessingJob job)
        {
            var entity = new JobStatusEntity
            {
                PartitionKey = "Job",
                RowKey = job.JobId,
                Status = job.Status,
                Date = job.Date,
                LocationId = job.LocationId,
                ResultMessage = job.ResultMessage
            };

            await _tableClient.UpsertEntityAsync(entity);
        }
    }
}