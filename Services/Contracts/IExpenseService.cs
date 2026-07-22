using Models.Dto;

namespace Services.Contracts
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetAllAsync();

        Task<ExpenseDto> CreateAsync(CreateExpenseRequest request);

        Task<ExpenseDto> UpdateAsync(int expenseId, CreateExpenseRequest request);

        Task<bool> DeleteAsync(int expenseId);

        Task<decimal> GetTotalAsync(int month, int year);
    }
}