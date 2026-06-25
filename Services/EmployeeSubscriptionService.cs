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
                .Include(x => x.Employee)
                .Select(x => new EmployeeSubscriptionDto
                {
                    EmployeeSubscriptionId = x.EmployeeSubscriptionId,
                    EmployeeId = x.EmployeeId,
                    EmployeeName = x.Employee.FirstName + " " + x.Employee.LastName,
                    LocationID = x.Employee.LocationID,
                    SubscriptionId = x.SubscriptionId,
                    Status = x.Status,
                    Quantity = x.Quantity
                })
                .ToListAsync();
        }

        public async Task<EmployeeSubscriptionDto?> GetByIdAsync(long id)
        {
            try
            {
                return await _context.EmployeeSubscriptions
                    .Where(x => x.EmployeeSubscriptionId == id)
                    .Select(x => new EmployeeSubscriptionDto
                    {
                        EmployeeSubscriptionId = x.EmployeeSubscriptionId,
                        EmployeeId = x.EmployeeId,
                        SubscriptionId = x.SubscriptionId,
                        Status = x.Status,
                        Quantity = x.Quantity
                    })
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving employee subscription with ID {id}.", ex);
            }
        }

        public async Task<EmployeeSubscriptionDto> CreateEmployeeSubscription(
            EmployeeSubscriptionDto dto)
        {
            try
            {
                if (dto.Status != "Active" &&
                    dto.Status != "Inactive" &&
                    dto.Status != "Freeze")
                {
                    throw new Exception("Status must be Active, Inactive or Freeze.");
                }

                if (dto.Quantity <= 0)
                {
                    throw new Exception("Quantity must be greater than zero.");
                }

                var alreadyExists = await _context.EmployeeSubscriptions
                    .AnyAsync(x =>
                        x.EmployeeId == dto.EmployeeId &&
                        x.SubscriptionId == dto.SubscriptionId);

                if (alreadyExists)
                {
                    throw new Exception("This subscription already assigned to employee.");
                }

                var entity = new EmployeeSubscription
                {
                    EmployeeId = dto.EmployeeId,
                    SubscriptionId = dto.SubscriptionId,
                    Status = dto.Status,
                    Quantity = dto.Quantity
                };

                _context.EmployeeSubscriptions.Add(entity);
                await _context.SaveChangesAsync();

                return new EmployeeSubscriptionDto
                {
                    EmployeeSubscriptionId = entity.EmployeeSubscriptionId,
                    EmployeeId = entity.EmployeeId,
                    SubscriptionId = entity.SubscriptionId,
                    Status = entity.Status,
                    Quantity = entity.Quantity
                };
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while creating the employee subscription.", ex);
            }
        }

        public async Task<EmployeeSubscriptionDto?> UpdateAsync(
            long id,
            EmployeeSubscriptionDto dto)
        {
            try
            {
                if (dto.Status != "Active" &&
                    dto.Status != "Inactive" &&
                    dto.Status != "Freeze")
                {
                    throw new Exception("Status must be Active, Inactive or Freeze.");
                }

                if (dto.Quantity <= 0)
                {
                    throw new Exception("Quantity must be greater than zero.");
                }

                var entity = await _context.EmployeeSubscriptions.FindAsync(id);

                if (entity == null)
                    return null;

                entity.EmployeeId = dto.EmployeeId;
                entity.SubscriptionId = dto.SubscriptionId;
                entity.Status = dto.Status;
                entity.Quantity = dto.Quantity;

                await _context.SaveChangesAsync();

                return new EmployeeSubscriptionDto
                {
                    EmployeeSubscriptionId = entity.EmployeeSubscriptionId,
                    EmployeeId = entity.EmployeeId,
                    SubscriptionId = entity.SubscriptionId,
                    Status = entity.Status,
                    Quantity = entity.Quantity
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while updating employee subscription with ID {id}.", ex);
            }
        }

        public async Task<bool> DeleteAsync(long id)
        {
            try
            {
                var entity = await _context.EmployeeSubscriptions.FindAsync(id);

                if (entity == null)
                    return false;

                _context.EmployeeSubscriptions.Remove(entity);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while deleting employee subscription with ID {id}.", ex);
            }
        }
    }
}