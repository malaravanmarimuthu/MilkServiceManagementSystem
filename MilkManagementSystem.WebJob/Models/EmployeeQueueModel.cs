namespace MilkManagementSystem.WebJob.Models
{
    public class EmployeeQueueModel
    {
        public long ID { get; set; }

        public string FirstName { get; set; }

        public string? LastName { get; set; }

        public string? EmailId { get; set; }

        public string? Mobile { get; set; }

        public long LocationID { get; set; }

        public long RoleID { get; set; }
    }
}