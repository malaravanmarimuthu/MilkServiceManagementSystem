using System;

namespace Common.Queue
{
    public class ProcessingJob
    {
        public string JobId { get; set; } = Guid.NewGuid().ToString();
        public string Status { get; set; } = "Pending";
        public string Date { get; set; }
        public int? LocationId { get; set; }
        public string ResultMessage { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}