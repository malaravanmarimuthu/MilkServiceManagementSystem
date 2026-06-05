using Common.BaseDto;

namespace Models.Dto
{
    public class EmployeeDto : BaseDto
    {
        public EmployeeDto() { }

        public string FirstName { get; set; }
        public string? Username {  get; set; }
        public string? LastName { get; set; }
        public string? EmailId { get; set; }
        public string? Mobile { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public long OrgId { get; set; }
        public bool? IsPostPaid { get; set; }
    }
}

