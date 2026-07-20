using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data.Entities;

namespace Services.Contracts
{
    public interface IReportService
    {
        Task<List<MilkReportRow>> GetMilkConsumptionReportAsync(string monthYear);
        Task<List<ProcurementReportRow>> GetProcurementReportAsync(string monthYear);
        Task<List<MilkReportMonthlyRow>> GetMilkConsumptionReport6MonthsAsync();
        Task<List<ProcurementReportMonthlyRow>> GetProcurementReport6MonthsAsync();
    }
}