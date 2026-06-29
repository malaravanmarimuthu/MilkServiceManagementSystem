using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Payment
    {
        public int PaymentID { get; set; }
        public int EmployeeID { get; set; }
        public int MilkEntryID { get; set; }
        public decimal Quantity { get; set; }
        public decimal RatePerLiter { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime PaidDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public Employee? Employee { get; set; }
        public MilkEntry? MilkEntry { get; set; }
    }
}
