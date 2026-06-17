using Common.BaseDto;
using Common.Enums;

namespace Models.Dto
{
    public class EmployeeDto : BaseDto
    {
        public EmployeeDto() { }

        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmailId { get; set; }
        public string? Mobile { get; set; }
        public long LocationID { get; set; }
        public long RoleID { get; set; }

        public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
    }
}

