using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class PaymentDto
    {
        public int PaymentID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int MilkEntryID { get; set; }
        public decimal Quantity { get; set; }
        public decimal RatePerLiter { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime PaidDate { get; set; }
    }
}
