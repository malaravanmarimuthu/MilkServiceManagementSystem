namespace Models.Dto
{
    public class RegisterDto
    {
        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? EmailId { get; set; }
        public string? Mobile { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public long OrgId { get; set; }
    }
}
