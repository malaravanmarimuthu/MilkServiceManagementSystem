using Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class MilkEntry
    {
        public long MilkEntryID { get; set; }
        public long EmployeeID { get; set; }
        public long LocationID { get; set; }
        public DateTime EntryDate { get; set; }
        public string EntryType { get; set; }
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedDate { get; set; }

        public virtual Employee Employee { get; set; }
        public virtual Location Location { get; set; }
    }
}
