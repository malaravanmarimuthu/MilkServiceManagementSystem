using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class ProcurementRateDto
    {
        public int Id { get; set; }
        public string MilkType { get; set; } = string.Empty;
        public decimal Rate { get; set; }
    }
}
