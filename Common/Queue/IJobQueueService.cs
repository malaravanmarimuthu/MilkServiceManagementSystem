using System.Threading.Tasks;

namespace Common.Queue
{
    public interface IJobQueueService
    {
        Task EnqueueAsync(ProcessingJob job);
        Task<QueueMessageResult> ReceiveNextAsync();
        Task DeleteMessageAsync(string messageId, string popReceipt);
        Task CompleteJobAsync(ProcessingJob job, string status, string resultMessage);
        Task<ProcessingJob> GetStatusAsync(string jobId);
    }

    public class QueueMessageResult
    {
        public ProcessingJob Job { get; set; }
        public string MessageId { get; set; }
        public string PopReceipt { get; set; }
    }
}