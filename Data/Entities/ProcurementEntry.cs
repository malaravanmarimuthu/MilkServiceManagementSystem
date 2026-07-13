using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class ProcurementEntry
    {
        public int ID { get; set; }
        public long EmployeeID { get; set; }
        public string MilkType { get; set; } = string.Empty;
        public decimal QuantityLiters { get; set; }
        public decimal RatePerLiter { get; set; }
        public decimal TotalAmount { get; set; }
        public Employee? Employee { get; set; }
    }
}
