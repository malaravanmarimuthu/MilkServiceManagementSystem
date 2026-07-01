using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Invoice
    {
        public long InvoiceID { get; set; }
        public string InvoiceNumber { get; set; } = "";
        public long EmployeeID { get; set; }
        public string EmployeeName { get; set; } = "";
        public DateTime GeneratedDate { get; set; } = DateTime.Today;
        public string MonthYear { get; set; } = "";
        public decimal TotalQuantity { get; set; }
        public decimal RatePerLitre { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PreviousArrears { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal BalanceDue { get; set; }
        public string Status { get; set; } = "Unpaid";
        public string? Notes { get; set; }
    }
}