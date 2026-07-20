using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class ExpenseDto
    {
        public int ExpenseID { get; set; }
        public string ExpenseType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ExpenseDate { get; set; } = string.Empty; 
        public string? Notes { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateExpenseRequest
    {
        public string ExpenseType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ExpenseDate { get; set; } = string.Empty; 
        public string? Notes { get; set; }
    }
}
