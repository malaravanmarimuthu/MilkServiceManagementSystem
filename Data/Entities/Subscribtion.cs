using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Subscription
    {
        public long SubscriptionID { get; set; }
        public string MilkType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal PricePerLiter { get; set; }
    }
}