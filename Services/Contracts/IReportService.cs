namespace Services.Contracts
{
    public interface IReportService
    {
        Task<List<PieChartRow>> GetPieChartReportAsync(string mode, string monthYear);
        Task<List<BarChartRow>> GetBarChartReportAsync(string mode, string monthYear);
    }
}