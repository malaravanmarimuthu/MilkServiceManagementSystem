using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class MilkReportRow
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EntryDate { get; set; } = string.Empty;
        public string EntryType { get; set; } = string.Empty;
        public double Quantity { get; set; }
    }

    public class ProcurementReportRow
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EntryDate { get; set; } = string.Empty;
        public string MilkType { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public double Rate { get; set; }
        public double TotalAmount { get; set; }
    }

    public class MilkReportMonthlyRow
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string MonthYear { get; set; } = string.Empty;
        public double Quantity { get; set; }
    }

    public class ProcurementReportMonthlyRow
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string MonthYear { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public double TotalAmount { get; set; }
    }
}