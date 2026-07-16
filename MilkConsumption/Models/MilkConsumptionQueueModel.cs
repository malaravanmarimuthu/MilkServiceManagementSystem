using System;

namespace AzureMilkConsumption.WebJob.Models
{
    public class MilkConsumptionQueueModel
    {
        public long LocationID { get; set; }

        public DateTime EntryDate { get; set; }
    }
}