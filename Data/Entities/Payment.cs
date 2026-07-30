using Models.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Entities
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        public int PaymentID { get; set; }

        [Required]
        public long EmployeeID { get; set; }

        [ForeignKey(nameof(EmployeeID))]
        public virtual Employee? Employee { get; set; }

        public long? MilkEntryID { get; set; }

        [ForeignKey(nameof(MilkEntryID))]
        public virtual MilkEntry? MilkEntry { get; set; }

        public long? InvoiceID { get; set; }

        [Column(TypeName = "decimal(65,30)")]
        public decimal? Quantity { get; set; }

        [Column(TypeName = "decimal(65,30)")]
        public decimal? RatePerLiter { get; set; }

        [Required]
        [Column(TypeName = "decimal(65,30)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public DateTime PaidDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}