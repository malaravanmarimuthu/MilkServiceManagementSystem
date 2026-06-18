namespace Models.Dto
{
    public class RegisterDto
    {
        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Password { get; set; }
        public string? EmailId { get; set; }
        public string? Mobile { get; set; }
        public long LocationID { get; set; }
    }
}
