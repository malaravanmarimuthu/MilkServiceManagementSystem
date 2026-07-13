using Data.Context;
using Microsoft.EntityFrameworkCore;
using Models.Dto;

public class ProcurementEntryService : IProcurementEntryService
{
    private readonly AuthDbContext _context;
    private readonly IProcurementRateService _rateService;
    private static readonly string[] ValidMilkTypes = { "Cow", "Buffalo" };

    public ProcurementEntryService(AuthDbContext context, IProcurementRateService rateService)
    {
        _context = context;
        _rateService = rateService;
    }

    private void ValidateMilkType(string milkType)
    {
        if (!ValidMilkTypes.Contains(milkType, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("MilkType must be 'Cow' or 'Buffalo'.");
    }

    private async Task<ProcurementEntryDto> ToDto(ProcurementEntry entry)
    {
        var employee = entry.Employee ?? await _context.Employees.FindAsync(entry.EmployeeID);

        return new ProcurementEntryDto
        {
            Id = entry.ID,
            EmployeeId = entry.EmployeeID,
            SupplierName = $"{employee?.FirstName} {employee?.LastName}".Trim(),
            MilkType = entry.MilkType,
            Quantity = entry.QuantityLiters,
            Rate = entry.RatePerLiter,
            TotalAmount = entry.TotalAmount,
            EntryDate = entry.EntryDate
        };
    }

    public async Task<List<ProcurementEntryDto>> GetAllAsync()
    {
        var entries = await _context.ProcurementEntries
            .Include(e => e.Employee)
            .OrderByDescending(e => e.ID)
            .ToListAsync();

        var result = new List<ProcurementEntryDto>();
        foreach (var entry in entries)
            result.Add(await ToDto(entry));

        return result;
    }

    public async Task<ProcurementEntryDto> AddAsync(ProcurementEntryDto dto)
    {
        ValidateMilkType(dto.MilkType);

        if (dto.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        var rate = dto.Rate > 0 ? dto.Rate : await _rateService.GetRateByMilkTypeAsync(dto.MilkType);

        if (rate <= 0)
            throw new ArgumentException($"Rate not set for {dto.MilkType}. Please set the rate first.");

        var entry = new ProcurementEntry
        {
            EmployeeID = dto.EmployeeId,
            MilkType = dto.MilkType,
            QuantityLiters = dto.Quantity,
            RatePerLiter = rate,
            TotalAmount = dto.Quantity * rate,
            EntryDate = dto.EntryDate == default ? DateTime.Now : dto.EntryDate
        };

        _context.ProcurementEntries.Add(entry);
        await _context.SaveChangesAsync();

        return await ToDto(entry);
    }

    public async Task<ProcurementEntryDto> UpdateAsync(ProcurementEntryDto dto)
    {
        ValidateMilkType(dto.MilkType);

        if (dto.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        if (dto.Rate <= 0)
            throw new ArgumentException("Rate must be greater than zero.");

        var entry = await _context.ProcurementEntries.FindAsync(dto.Id);
        if (entry == null)
            throw new ArgumentException("Entry not found.");

        entry.EmployeeID = dto.EmployeeId;
        entry.MilkType = dto.MilkType;
        entry.QuantityLiters = dto.Quantity;
        entry.RatePerLiter = dto.Rate;
        entry.TotalAmount = dto.Quantity * dto.Rate;
        if (dto.EntryDate != default)
            entry.EntryDate = dto.EntryDate;

        await _context.SaveChangesAsync();

        return await ToDto(entry);
    }

    public async Task DeleteAsync(int id)
    {
        var entry = await _context.ProcurementEntries.FindAsync(id);
        if (entry != null)
        {
            _context.ProcurementEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }
    }
}