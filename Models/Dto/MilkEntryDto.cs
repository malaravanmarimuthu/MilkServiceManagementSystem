using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class MilkEntryDto
    {
        public long MilkEntryID { get; set; }
        public long EmployeeID { get; set; }
        public string? EmployeeName { get; set; }
        public long LocationID { get; set; }
        public string? LocationName { get; set; }
        public DateTime EntryDate { get; set; }
        public string EntryType { get; set; }
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
    }
}
