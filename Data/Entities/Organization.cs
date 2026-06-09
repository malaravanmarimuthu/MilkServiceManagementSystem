using Common.BaseEntity;
using Common.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Entities
{
    public class Organization : BaseEntityModel
    {
        [Key]
        public override long ID { get; set; }
        public string Name { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public bool? IsAgent { get; set; }
        public bool? AlsoCustomer { get; set; }
        public string? Address1 { get; set; }
        //public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        [Column(TypeName = "nvarchar(100)")]
        public string? Country { get; set; }
        public string? PinCode { get; set; }
        public string? Phone { get; set; }
        public long? ParentCompanyID { get; set; }
        public string? TinNo { get; set; }
        public string? BankAcNo { get; set; }
        public string? BankName { get; set; }
        public string? AccountType { get; set; }
        public string? BankBranch { get; set; }
        public string? IFSC { get; set; }
        public string? MICR { get; set; }
        public string? BankOtherDetails { get; set; }
        public string? LicenseNo { get; set; }
        public string? EmergencyName { get; set; }
        public string? EmerPhone { get; set; }
        public string? EmerAddress { get; set; }
        public string? Location { get; set; }
        public OrganizationStatus Status { get; set; } = OrganizationStatus.Pending;
        public string? Comments { get; set; }
        public int? AdvancePayPercent { get; set; }
        public bool? IsPostPaid { get; set; }
    }


}
