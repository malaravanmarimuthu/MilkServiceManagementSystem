namespace Models.Dto
{
    public class ExpenseDto
    {
        public int ExpenseID { get; set; }

        public string ExpenseType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string ExpenseDate { get; set; } = string.Empty;

        public string? Notes { get; set; }
    }

    public class CreateExpenseRequest
    {
        public string ExpenseType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string ExpenseDate { get; set; } = string.Empty;

        public string? Notes { get; set; }
    }
}