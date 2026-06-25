using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class EmployeeSubscriptionDto
    {
        public long EmployeeSubscriptionId { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = "";
        public long LocationID { get; set; }
        public long SubscriptionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Quantity { get; set; }

    }
}
