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
        public string? LocationName { get; set; }

        public long RoleID { get; set; }
        public string? RoleName { get; set; }

        public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Photourl { get; set; }
    }

    public class UpdateEmployeeLocationDto
    {
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}