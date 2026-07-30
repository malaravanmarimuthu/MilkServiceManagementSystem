using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class PaymentDto
    {
        public int PaymentID { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public long MilkEntryID { get; set; }
        public decimal Quantity { get; set; }
        public decimal RatePerLiter { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime PaidDate { get; set; }
    }
    public class AddPaymentRequest
    {
        public decimal Amount { get; set; }
        public DateTime? PaidDate { get; set; }
    }

    public class UpdatePaymentEntryRequest
    {
        public decimal Amount { get; set; }
        public DateTime? PaidDate { get; set; }
    }

    public class PaymentEntryDto
    {
        public long PaymentID { get; set; }
        public long InvoiceID { get; set; }
        public decimal Amount { get; set; }
        public string PaidDate { get; set; } = "";
    }

    public class UpdateArrearsRequest
    {
        public decimal PreviousArrears { get; set; }
    }
}
