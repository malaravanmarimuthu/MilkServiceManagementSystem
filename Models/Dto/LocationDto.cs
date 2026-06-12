using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class LocationDto
    {
        public long LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
    }
}
