using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Models.Dto;

namespace Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly string _connectionString;
        private readonly ILogger<ExpenseService> _logger;

        public ExpenseService(IConfiguration config, ILogger<ExpenseService> logger)
        {
            _connectionString = config.GetConnectionString("DefaultConnection") ?? "";
            _logger = logger;
        }

        private MySql.Data.MySqlClient.MySqlConnection CreateConnection() => new MySql.Data.MySqlClient.MySqlConnection(_connectionString);

        public async Task<List<ExpenseDto>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Started -> GetAllAsync Expenses");
                using var conn = CreateConnection();
                var result = await conn.QueryAsync<ExpenseDto>(
                    "sp_Expense",
                    new
                    {
                        p_Action = "GET",
                        p_ExpenseID = 0,
                        p_ExpenseType = "",
                        p_Description = "",
                        p_Amount = 0m,
                        p_ExpenseDate = "",
                        p_Notes = "",
                        p_Month = 0,
                        p_Year = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return result.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> GetAllAsync: {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> GetAllAsync Expenses");
            }
        }

        public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest request)
        {
            try
            {
                _logger.LogInformation($"Started -> CreateAsync: {request.ExpenseType}");
                using var conn = CreateConnection();
                var result = await conn.QueryAsync<ExpenseDto>(
                    "sp_Expense",
                    new
                    {
                        p_Action = "ADD",
                        p_ExpenseID = 0,
                        p_ExpenseType = request.ExpenseType,
                        p_Description = request.Description,
                        p_Amount = request.Amount,
                        p_ExpenseDate = request.ExpenseDate,
                        p_Notes = request.Notes ?? "",
                        p_Month = 0,
                        p_Year = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return result.FirstOrDefault() ?? throw new Exception("Create failed.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> CreateAsync: {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> CreateAsync");
            }
        }

        public async Task<ExpenseDto> UpdateAsync(int expenseId, CreateExpenseRequest request)
        {
            try
            {
                _logger.LogInformation($"Started -> UpdateAsync Id: {expenseId}");
                using var conn = CreateConnection();
                var result = await conn.QueryAsync<ExpenseDto>(
                    "sp_Expense",
                    new
                    {
                        p_Action = "UPDATE",
                        p_ExpenseID = expenseId,
                        p_ExpenseType = request.ExpenseType,
                        p_Description = request.Description,
                        p_Amount = request.Amount,
                        p_ExpenseDate = request.ExpenseDate,
                        p_Notes = request.Notes ?? "",
                        p_Month = 0,
                        p_Year = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return result.FirstOrDefault() ?? throw new Exception("Update failed.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> UpdateAsync: {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> UpdateAsync Id: {expenseId}");
            }
        }

        public async Task<bool> DeleteAsync(int expenseId)
        {
            try
            {
                _logger.LogInformation($"Started -> DeleteAsync Id: {expenseId}");
                using var conn = CreateConnection();
                await conn.ExecuteAsync(
                    "sp_Expense",
                    new
                    {
                        p_Action = "DELETE",
                        p_ExpenseID = expenseId,
                        p_ExpenseType = "",
                        p_Description = "",
                        p_Amount = 0m,
                        p_ExpenseDate = "",
                        p_Notes = "",
                        p_Month = 0,
                        p_Year = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> DeleteAsync: {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> DeleteAsync Id: {expenseId}");
            }
        }

        public async Task<decimal> GetTotalAsync(int month, int year)
        {
            try
            {
                _logger.LogInformation($"Started -> GetTotalAsync Month:{month} Year:{year}");
                using var conn = CreateConnection();
                var result = await conn.QueryFirstOrDefaultAsync<decimal>(
                    "sp_Expense",
                    new
                    {
                        p_Action = "TOTAL",
                        p_ExpenseID = 0,
                        p_ExpenseType = "",
                        p_Description = "",
                        p_Amount = 0m,
                        p_ExpenseDate = "",
                        p_Notes = "",
                        p_Month = month,
                        p_Year = year
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> GetTotalAsync: {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> GetTotalAsync");
            }
        }
    }
}