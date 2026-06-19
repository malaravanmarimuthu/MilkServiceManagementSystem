using Data.Context;
using Data.Entities;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Services.Contracts;

namespace Services
{
    public class EmployeeSubscriptionService : IEmployeeSubscriptionService
    {
        private readonly AuthDbContext _context;

        public EmployeeSubscriptionService(AuthDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeSubscriptionDto>> GetAllAsync()
        {
            return await _context.EmployeeSubscriptions
                .Select(x => x.Adapt<EmployeeSubscriptionDto>())
                .ToListAsync();
        }

        public async Task<EmployeeSubscriptionDto?> GetByIdAsync(long id)
        {
            return await _context.EmployeeSubscriptions
                .Where(x => x.EmployeeSubscriptionId == id)
                .Select(x => x.Adapt<EmployeeSubscriptionDto>())
                .FirstOrDefaultAsync();
        }

        public async Task<EmployeeSubscriptionDto> CreateEmployeeSubscription(
            EmployeeSubscriptionDto dto)
        {
            if (dto.Status != "Active" &&
                dto.Status != "Inactive" &&
                dto.Status != "Freeze")
            {
                throw new Exception("Status must be Active, Inactive or Freeze.");
            }

            var alreadyExists = await _context.EmployeeSubscriptions
                .AnyAsync(x =>
                    x.EmployeeId == dto.EmployeeId &&
                    x.SubscriptionId == dto.SubscriptionId);

            if (alreadyExists)
            {
                throw new Exception("This subscription already assigned to employee.");
            }

            var entity = dto.Adapt<EmployeeSubscription>();

            _context.EmployeeSubscriptions.Add(entity);
            await _context.SaveChangesAsync();

            return entity.Adapt<EmployeeSubscriptionDto>();
        }

        public async Task<EmployeeSubscriptionDto?> UpdateAsync(
            long id,
            EmployeeSubscriptionDto dto)
        {
            if (dto.Status != "Active" &&
                dto.Status != "Inactive" &&
                dto.Status != "Freeze")
            {
                throw new Exception("Status must be Active, Inactive or Freeze.");
            }

            var entity = await _context.EmployeeSubscriptions.FindAsync(id);

            if (entity == null)
                return null;

            entity.EmployeeId = dto.EmployeeId;
            entity.SubscriptionId = dto.SubscriptionId;
            entity.Status = dto.Status;

            await _context.SaveChangesAsync();

            return entity.Adapt<EmployeeSubscriptionDto>();
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entity = await _context.EmployeeSubscriptions.FindAsync(id);

            if (entity == null)
                return false;

            _context.EmployeeSubscriptions.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}