namespace Services.Contracts
{
    public interface IReportService
    {
        Task<List<MilkReportRow>> GetMilkSalesReportAsync(string mode, string monthYear);
        Task<List<ProcurementReportRow>> GetProcurementReportAsync(string mode, string monthYear);
    }
}