using Data.Context;
using Microsoft.EntityFrameworkCore;
using Models.Dto;

public class ProcurementRateService : IProcurementRateService
{
    private readonly AuthDbContext _context;
    private static readonly string[] ValidMilkTypes = { "Cow", "Buffalo" };

    public ProcurementRateService(AuthDbContext context)
    {
        _context = context;
    }

    private void ValidateMilkType(string milkType)
    {
        if (!ValidMilkTypes.Contains(milkType, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("MilkType must be 'Cow' or 'Buffalo'.");
    }

    private static ProcurementRateDto ToDto(ProcurementRate r) => new()
    {
        Id = r.ID,
        MilkType = r.MilkType,
        Rate = r.RatePerLiter
    };

    public async Task<List<ProcurementRateDto>> GetAllAsync()
    {
        var rates = await _context.ProcurementRates.ToListAsync();
        return rates.Select(ToDto).ToList();
    }


    public async Task<ProcurementRateDto> AddAsync(ProcurementRateDto dto)
    {
        ValidateMilkType(dto.MilkType);

        if (dto.Rate <= 0)
            throw new ArgumentException("Rate must be greater than zero.");

        var existing = await _context.ProcurementRates
            .FirstOrDefaultAsync(r => r.MilkType == dto.MilkType);

        if (existing != null)
            throw new ArgumentException($"Rate for {dto.MilkType} already exists. Use update instead.");

        var rate = new ProcurementRate
        {
            MilkType = dto.MilkType,
            RatePerLiter = dto.Rate
        };

        _context.ProcurementRates.Add(rate);
        await _context.SaveChangesAsync();

        return ToDto(rate);
    }

    public async Task<ProcurementRateDto> UpdateAsync(ProcurementRateDto dto)
    {
        ValidateMilkType(dto.MilkType);

        if (dto.Rate <= 0)
            throw new ArgumentException("Rate must be greater than zero.");

        var rate = await _context.ProcurementRates.FindAsync(dto.Id);
        if (rate == null)
            throw new ArgumentException("Rate record not found.");

        rate.MilkType = dto.MilkType;
        rate.RatePerLiter = dto.Rate;

        await _context.SaveChangesAsync();

        return ToDto(rate);
    }

    public async Task DeleteAsync(int id)
    {
        var rate = await _context.ProcurementRates.FindAsync(id);
        if (rate != null)
        {
            _context.ProcurementRates.Remove(rate);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<decimal> GetRateByMilkTypeAsync(string milkType)
    {
        ValidateMilkType(milkType);

        var rate = await _context.ProcurementRates
            .FirstOrDefaultAsync(r => r.MilkType == milkType);

        return rate?.RatePerLiter ?? 0;
    }
}