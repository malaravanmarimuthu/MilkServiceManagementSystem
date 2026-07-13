using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class ProcurementEntryDto
    {
        public int Id { get; set; }
        public long EmployeeId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string MilkType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
