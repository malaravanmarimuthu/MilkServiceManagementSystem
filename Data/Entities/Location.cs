using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Location
    {
        public long LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
    }
}