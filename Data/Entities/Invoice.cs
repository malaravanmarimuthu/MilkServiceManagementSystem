using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Entities
{
    [Table("Invoices")]
    public class Invoice
    {
        [Key]
        public long InvoiceID { get; set; }

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = "";

        [Required]
        public long EmployeeID { get; set; }

        [Required]
        [MaxLength(150)]
        public string EmployeeName { get; set; } = "";

        [Required]
        public DateTime GeneratedDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string MonthYear { get; set; } = "";

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalQuantity { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal RatePerLitre { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PreviousArrears { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal AmountPaid { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal BalanceDue { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Unpaid";

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}