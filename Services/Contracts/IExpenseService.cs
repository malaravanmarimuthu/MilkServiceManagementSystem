using Models.Dto;

namespace Services.Contracts
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetAllAsync();
        Task<ExpenseDto> CreateAsync(CreateExpenseRequest req);
        Task<ExpenseDto> UpdateAsync(int id, CreateExpenseRequest req);
        Task<bool> DeleteAsync(int id);
        Task<decimal> GetTotalAsync(string? monthYear);
    }
}