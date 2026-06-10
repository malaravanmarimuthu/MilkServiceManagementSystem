using Common.BaseEntity;
using Common.Enums;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Entities
{
    public class Employee : BaseEntityModel
    {
        [Key]
        public override long ID { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string FirstName { get; set; }

        [Column(TypeName = "nvarchar(100)")]

        public string Username { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        public string? LastName { get; set; }

        [Column(TypeName = "nvarchar(200)")]
        public string? EmailId { get; set; }

        [Column(TypeName = "nvarchar(25)")]
        public string? Mobile { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string? Department { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string? Designation { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string? Password { get; set; }
        public DateTime? HiEmployee { get; set; } = DateTime.UtcNow;
        public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
        public long OrgId { get; set; }
        public long OrganizationID { get; set; }
        [ForeignKey("OrganizationID")]
        public Organization? organization { get; set; }
    }
}
