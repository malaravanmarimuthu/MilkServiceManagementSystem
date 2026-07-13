using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class ProcurementRate
    {
        public int ID { get; set; }
        public string MilkType { get; set; } = string.Empty;  
        public decimal RatePerLiter { get; set; }
    }
}
