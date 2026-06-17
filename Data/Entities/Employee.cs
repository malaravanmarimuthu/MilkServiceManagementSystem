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

        public string? LastName { get; set; }

        [Column(TypeName = "nvarchar(200)")]
        public string? EmailId { get; set; }

        [Column(TypeName = "nvarchar(25)")]
        public string? Mobile { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string? Password { get; set; }
        public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
       
    }
}
