using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.Data;
using Data.Entities;
using Services.Contracts;

namespace Services
{
    public class ReportService : IReportService
    {
        private readonly string _connectionString;

        public ReportService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<List<MilkReportRow>> GetMilkConsumptionReportAsync(string monthYear)
        {
            var results = new List<MilkReportRow>();

            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("sp_GetMilkConsumptionReport", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("p_MonthYear", monthYear);

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new MilkReportRow
                {
                    EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                    EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "Unknown" : reader.GetString("EmployeeName"),
                    EntryDate = reader.GetDateTime("EntryDate").ToString("yyyy-MM-dd"),
                    EntryType = reader.IsDBNull(reader.GetOrdinal("EntryType")) ? "Actual" : reader.GetString("EntryType"),
                    Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity")
                });
            }

            return results;
        }

        public async Task<List<ProcurementReportRow>> GetProcurementReportAsync(string monthYear)
        {
            var results = new List<ProcurementReportRow>();

            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("sp_GetProcurementReport", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("p_MonthYear", monthYear);

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new ProcurementReportRow
                {
                    EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                    EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "Unknown" : reader.GetString("EmployeeName"),
                    EntryDate = reader.GetDateTime("EntryDate").ToString("yyyy-MM-dd"),
                    MilkType = reader.IsDBNull(reader.GetOrdinal("MilkType")) ? "Unknown" : reader.GetString("MilkType"),
                    Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity"),
                    Rate = reader.IsDBNull(reader.GetOrdinal("Rate")) ? 0 : reader.GetDouble("Rate"),
                    TotalAmount = reader.IsDBNull(reader.GetOrdinal("TotalAmount")) ? 0 : reader.GetDouble("TotalAmount")
                });
            }

            return results;
        }

        public async Task<List<MilkReportMonthlyRow>> GetMilkConsumptionReport6MonthsAsync()
        {
            var results = new List<MilkReportMonthlyRow>();

            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("sp_GetMilkConsumptionReport6Months", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new MilkReportMonthlyRow
                {
                    EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                    EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "Unknown" : reader.GetString("EmployeeName"),
                    MonthYear = reader.IsDBNull(reader.GetOrdinal("MonthYear")) ? "" : reader.GetString("MonthYear"),
                    Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity")
                });
            }

            return results;
        }

        public async Task<List<ProcurementReportMonthlyRow>> GetProcurementReport6MonthsAsync()
        {
            var results = new List<ProcurementReportMonthlyRow>();

            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("sp_GetProcurementReport6Months", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new ProcurementReportMonthlyRow
                {
                    EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                    EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "Unknown" : reader.GetString("EmployeeName"),
                    MonthYear = reader.IsDBNull(reader.GetOrdinal("MonthYear")) ? "" : reader.GetString("MonthYear"),
                    Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity"),
                    TotalAmount = reader.IsDBNull(reader.GetOrdinal("TotalAmount")) ? 0 : reader.GetDouble("TotalAmount")
                });
            }

            return results;
        }
    }
}