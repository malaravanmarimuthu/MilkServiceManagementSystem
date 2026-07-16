namespace Models.Request
{
    public class MilkConsumptionQueueRequest
    {
        public long LocationID { get; set; }

        public DateTime EntryDate { get; set; }
    }
}