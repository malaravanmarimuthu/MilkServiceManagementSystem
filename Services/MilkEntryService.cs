using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Models.Models;
using Services.Contracts;

namespace Services
{
    public class MilkEntryService(
        IRepositary<MilkEntry> milkEntryRepository,
        ILogger<MilkEntryService> logger) : IMilkEntryService
    {
        private readonly IRepositary<MilkEntry> _milkEntryRepository = milkEntryRepository;
        private readonly ILogger<MilkEntryService> _logger = logger;

        public async ValueTask<List<MilkEntryDto>> GetAll()
        {
            var entries = await _milkEntryRepository
                .FindAll()
                .Include(x => x.Employee)
                .Include(x => x.Location)
                .OrderByDescending(x => x.EntryDate)
                .ToListAsync();

            return entries.Select(x => new MilkEntryDto
            {
                MilkEntryID = x.MilkEntryID,
                EmployeeID = x.EmployeeID,
                EmployeeName = x.Employee != null
                    ? $"{x.Employee.FirstName} {x.Employee.LastName}"
                    : "",
                LocationID = x.LocationID,
                LocationName = x.Location != null ? x.Location.LocationName : "",
                EntryDate = x.EntryDate,
                EntryType = x.EntryType,
                Quantity = x.Quantity,
                Notes = x.Notes,
            }).ToList();
        }

        public async ValueTask<bool> Create(MilkEntryDto dto)
        {
            var entity = new MilkEntry
            {
                EmployeeID = dto.EmployeeID,
                LocationID = dto.LocationID,
                EntryDate = dto.EntryDate,
                EntryType = dto.EntryType,
                Quantity = dto.Quantity,
                Notes = dto.Notes,
                CreatedDate = DateTime.UtcNow,
            };
            await _milkEntryRepository.CreateAsync(entity);
            return true;
        }

        public async ValueTask<bool> Delete(long id)
        {
            var entity = await _milkEntryRepository
                .FindByCondition(x => x.MilkEntryID == id)
                .FirstOrDefaultAsync();
            if (entity == null) return false;
            await _milkEntryRepository.DeleteAsync(entity);
            return true;
        }
    }
}