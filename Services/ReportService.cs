using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.Data;

namespace Services
{
    public class ReportService : IReportService
    {
        private readonly string _connectionString;
        private readonly ILogger<ReportService> _logger;

        public ReportService(IConfiguration configuration, ILogger<ReportService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            _logger = logger;
        }

        public async Task<List<MilkReportRow>> GetMilkSalesReportAsync(string mode, string monthYear)
        {
            var results = new List<MilkReportRow>();

            try
            {
                using var conn = new MySqlConnection(_connectionString);
                using var cmd = new MySqlCommand("sp_GetMilkSalesReport", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("p_Mode", mode);
                cmd.Parameters.AddWithValue("p_MonthYear", monthYear ?? "");

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new MilkReportRow
                    {
                        EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                        EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "" : reader.GetString("EmployeeName"),
                        LocationID = reader.IsDBNull(reader.GetOrdinal("LocationID")) ? 0 : reader.GetInt32("LocationID"),
                        LocationName = reader.IsDBNull(reader.GetOrdinal("LocationName")) ? "Other" : reader.GetString("LocationName"),
                        EntryDate = reader.IsDBNull(reader.GetOrdinal("EntryDate")) ? "" : reader.GetDateTime("EntryDate").ToString("yyyy-MM-dd"),
                        EntryType = reader.IsDBNull(reader.GetOrdinal("EntryType")) ? "" : reader.GetString("EntryType"),
                        Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity"),
                        TotalAmount = reader.IsDBNull(reader.GetOrdinal("TotalAmount")) ? 0 : reader.GetDouble("TotalAmount")
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load milk sales report (mode={Mode}, monthYear={MonthYear})", mode, monthYear);
                throw;
            }

            return results;
        }

        public async Task<List<ProcurementReportRow>> GetProcurementReportAsync(string mode, string monthYear)
        {
            var results = new List<ProcurementReportRow>();

            try
            {
                using var conn = new MySqlConnection(_connectionString);
                using var cmd = new MySqlCommand("sp_GetProcurementReport", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("p_Mode", mode);
                cmd.Parameters.AddWithValue("p_MonthYear", monthYear ?? "");

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new ProcurementReportRow
                    {
                        EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                        EmployeeName = reader.IsDBNull(reader.GetOrdinal("EmployeeName")) ? "" : reader.GetString("EmployeeName"),
                        LocationID = reader.IsDBNull(reader.GetOrdinal("LocationID")) ? 0 : reader.GetInt32("LocationID"),
                        LocationName = reader.IsDBNull(reader.GetOrdinal("LocationName")) ? "Other" : reader.GetString("LocationName"),
                        EntryDate = reader.IsDBNull(reader.GetOrdinal("EntryDate")) ? "" : reader.GetDateTime("EntryDate").ToString("yyyy-MM-dd"),
                        MilkType = reader.IsDBNull(reader.GetOrdinal("MilkType")) ? "" : reader.GetString("MilkType"),
                        Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity"),
                        Rate = reader.IsDBNull(reader.GetOrdinal("Rate")) ? 0 : reader.GetDouble("Rate"),
                        TotalAmount = reader.IsDBNull(reader.GetOrdinal("TotalAmount")) ? 0 : reader.GetDouble("TotalAmount")
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load procurement report (mode={Mode}, monthYear={MonthYear})", mode, monthYear);
                throw;
            }

            return results;
        }
    }
}