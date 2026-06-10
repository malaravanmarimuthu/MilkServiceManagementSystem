using Common.BaseDto;
using Common.Enums;

namespace Models.Dto
{
    public class EmployeeDto : BaseDto
    {
        public EmployeeDto() { }

        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? EmailId { get; set; }
        public string? Mobile { get; set; }
        public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
    }
}

