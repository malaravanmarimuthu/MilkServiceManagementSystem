using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Enums;

namespace Data.Entities
{
    public class EmployeeSubscription
    {
        public long EmployeeSubscriptionId { get; set; }

        public long EmployeeId { get; set; }

        public long SubscriptionId { get; set; }

        public string Status { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        //public Employee Employee { get; set; } = null!;

        //public Subscription Subscription { get; set; } = null!;
    }
}
