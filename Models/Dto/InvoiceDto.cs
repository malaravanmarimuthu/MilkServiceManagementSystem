namespace Models.Dto
{
    public class InvoiceDto
    {
        public long InvoiceID { get; set; }
        public string InvoiceNumber { get; set; } = "";
        public long EmployeeID { get; set; }
        public string EmployeeName { get; set; } = "";
        public string GeneratedDate { get; set; } = "";
        public string MonthYear { get; set; } = "";
        public decimal TotalQuantity { get; set; }
        public decimal RatePerLitre { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PreviousArrears { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal BalanceDue { get; set; }
        public string Status { get; set; } = "";
        public string? Notes { get; set; }

        public decimal LastMonthQuantity { get; set; }
        public decimal LastMonthAmount { get; set; } 
    }

    public class CreateInvoiceRequest
    {
        public long EmployeeID { get; set; }
        public string MonthYear { get; set; } = "";
        public decimal PreviousArrears { get; set; }
        public string? Notes { get; set; }
    }
}