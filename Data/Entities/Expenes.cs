using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Expense
    {
        [Key]
        public int ExpenseID { get; set; }

        [Required]
        [MaxLength(50)]
        public string ExpenseType { get; set; } = string.Empty; 

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty; 

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime ExpenseDate { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
