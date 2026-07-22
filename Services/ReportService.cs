using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.Data;
using Models.Dto;

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

        public async Task<List<PieChartRow>> GetPieChartReportAsync(string mode, string monthYear)
        {
            var results = new List<PieChartRow>();

            try
            {
                using var conn = new MySqlConnection(_connectionString);
                using var cmd = new MySqlCommand("sp_GetPieChartReport", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("p_Mode", mode);
                cmd.Parameters.AddWithValue("p_MonthYear", monthYear ?? "");

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new PieChartRow
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
                _logger.LogError(ex, "Failed to load pie chart report (mode={Mode}, monthYear={MonthYear})", mode, monthYear);
                throw;
            }

            return results;
        }

        public async Task<List<BarChartRow>> GetBarChartReportAsync(string mode, string monthYear)
        {
            var results = new List<BarChartRow>();

            try
            {
                using var conn = new MySqlConnection(_connectionString);
                using var cmd = new MySqlCommand("sp_GetBarChartReport", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("p_Mode", mode);
                cmd.Parameters.AddWithValue("p_MonthYear", monthYear ?? "");

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new BarChartRow
                    {
                        SourceType = reader.IsDBNull(reader.GetOrdinal("SourceType")) ? "" : reader.GetString("SourceType"),
                        EmployeeID = reader.IsDBNull(reader.GetOrdinal("EmployeeID")) ? 0 : reader.GetInt32("EmployeeID"),
                        LocationID = reader.IsDBNull(reader.GetOrdinal("LocationID")) ? 0 : reader.GetInt32("LocationID"),
                        LocationName = reader.IsDBNull(reader.GetOrdinal("LocationName")) ? "Other" : reader.GetString("LocationName"),
                        EntryDate = reader.IsDBNull(reader.GetOrdinal("EntryDate")) ? "" : reader.GetDateTime("EntryDate").ToString("yyyy-MM-dd"),
                        Quantity = reader.IsDBNull(reader.GetOrdinal("Quantity")) ? 0 : reader.GetDouble("Quantity"),
                        Amount = reader.IsDBNull(reader.GetOrdinal("Amount")) ? 0 : reader.GetDouble("Amount")
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load bar chart report (mode={Mode}, monthYear={MonthYear})", mode, monthYear);
                throw;
            }

            return results;
        }
    }
}