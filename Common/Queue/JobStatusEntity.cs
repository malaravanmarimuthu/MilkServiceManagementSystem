using Azure;
using Azure.Data.Tables;
using System;

namespace Common.Queue
{
    public class JobStatusEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = "Job";
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Status { get; set; }
        public string Date { get; set; }
        public int? LocationId { get; set; }
        public string ResultMessage { get; set; }
    }
}