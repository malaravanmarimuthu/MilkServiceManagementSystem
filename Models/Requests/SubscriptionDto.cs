using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class SubscriptionDto
    {
        public string MilkType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal PricePerLiter { get; set; }
    }
}