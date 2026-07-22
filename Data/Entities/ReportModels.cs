using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class PieChartRow
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string EntryDate { get; set; } = string.Empty;
        public string EntryType { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public double TotalAmount { get; set; }
    }

    public class BarChartRow
    {
        public string SourceType { get; set; } = string.Empty;
        public int EmployeeID { get; set; }
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string EntryDate { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public double Amount { get; set; }
    }
}