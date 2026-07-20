using Data.Context;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Services.Contracts;

public class ExpenseService : IExpenseService
{
    private readonly AuthDbContext _db;

    private static readonly string[] ValidTypes = { "Bike", "Salary", "Material", "Others" };

    public ExpenseService(AuthDbContext db)
    {
        _db = db;
    }

    public async Task<List<ExpenseDto>> GetAllAsync()
    {
        var expenses = await _db.Expenses
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.ExpenseID)
            .ToListAsync();

        return expenses.Adapt<List<ExpenseDto>>();
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest req)
    {
        Validate(req);

        var expense = req.Adapt<Data.Entities.Expense>();
        expense.ExpenseType = req.ExpenseType.Trim();
        expense.Description = req.Description.Trim();
        expense.ExpenseDate = ParseDate(req.ExpenseDate);
        expense.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();
        expense.CreatedDate = DateTime.Today;

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        return expense.Adapt<ExpenseDto>();
    }

    public async Task<ExpenseDto> UpdateAsync(int id, CreateExpenseRequest req)
    {
        var expense = await _db.Expenses.FindAsync(id)
            ?? throw new Exception("Expense not found.");

        Validate(req);

        expense.ExpenseType = req.ExpenseType.Trim();
        expense.Description = req.Description.Trim();
        expense.Amount = req.Amount;
        expense.ExpenseDate = ParseDate(req.ExpenseDate);
        expense.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();

        await _db.SaveChangesAsync();

        return expense.Adapt<ExpenseDto>();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense == null) return false;

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> GetTotalAsync(string? monthYear)
    {
        var query = _db.Expenses.AsQueryable();

        if (!string.IsNullOrWhiteSpace(monthYear))
        {
            if (!DateTime.TryParseExact(
                    monthYear + "-01", "yyyy-MM-dd", null,
                    System.Globalization.DateTimeStyles.None,
                    out DateTime parsedDate))
            {
                throw new Exception($"Invalid MonthYear format: '{monthYear}'. Use YYYY-MM (e.g. 2026-06)");
            }

            var fromDate = new DateTime(parsedDate.Year, parsedDate.Month, 1);
            var toDate = fromDate.AddMonths(1).AddDays(-1);

            query = query.Where(e => e.ExpenseDate >= fromDate && e.ExpenseDate <= toDate);
        }

        return await query.SumAsync(e => (decimal?)e.Amount) ?? 0;
    }

    private static void Validate(CreateExpenseRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ExpenseType))
            throw new Exception("Expense type is required.");

        if (!ValidTypes.Contains(req.ExpenseType))
            throw new Exception("Invalid expense type. Allowed: Bike, Salary, Material, Others.");

        if (string.IsNullOrWhiteSpace(req.Description))
            throw new Exception("Description is required.");

        if (req.Amount <= 0)
            throw new Exception("Amount must be greater than zero.");

        if (!DateTime.TryParse(req.ExpenseDate, out _))
            throw new Exception("Invalid expense date.");
    }

    private static DateTime ParseDate(string dateStr) =>
        DateTime.ParseExact(dateStr, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
}