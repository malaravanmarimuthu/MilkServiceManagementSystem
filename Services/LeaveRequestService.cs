using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Services.Contracts;

namespace Services
{
    public class LeaveRequestService(
        IRepositary<LeaveRequest> leaveRepository,
        ILogger<LeaveRequestService> logger)
        : ILeaveRequestService
    {
        private readonly IRepositary<LeaveRequest> _leaveRepository = leaveRepository;
        private readonly ILogger<LeaveRequestService> _logger = logger;

        public async ValueTask<List<LeaveRequestDto>> GetAll()
        {
            try
            {
                var leaveList = await _leaveRepository
                    .FindAll()
                    .Include(x => x.Employee)
                    .ToListAsync();

                return leaveList.Select(x => new LeaveRequestDto
                {
                    LeaveRequestID = x.LeaveRequestID,
                    EmployeeID = x.EmployeeID,
                    EmployeeName = x.Employee != null
                        ? x.Employee.FirstName + " " + x.Employee.LastName
                        : "",
                    LeaveType = x.LeaveType,
                    FromDate = x.FromDate,
                    ToDate = x.ToDate,
                    Reason = x.Reason,
                    Status = x.Status
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        public async ValueTask<LeaveRequestDto> GetById(long id)
        {
            try
            {
                var leave = await _leaveRepository
                    .FindByCondition(x => x.LeaveRequestID == id)
                    .Include(x => x.Employee)
                    .FirstOrDefaultAsync();

                if (leave == null)
                    return null;

                return new LeaveRequestDto
                {
                    LeaveRequestID = leave.LeaveRequestID,
                    EmployeeID = leave.EmployeeID,
                    EmployeeName = leave.Employee != null
                        ? leave.Employee.FirstName + " " + leave.Employee.LastName
                        : "",
                    LeaveType = leave.LeaveType,
                    FromDate = leave.FromDate,
                    ToDate = leave.ToDate,
                    Reason = leave.Reason,
                    Status = leave.Status
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        public async ValueTask<bool> Create(LeaveRequestDto dto)
        {
            try
            {
                var leave = new LeaveRequest
                {
                    EmployeeID = dto.EmployeeID,
                    LeaveType = dto.LeaveType,
                    FromDate = dto.FromDate,
                    ToDate = dto.ToDate,
                    Reason = dto.Reason,
                    Status = "Pending"
                };

                await _leaveRepository.CreateAsync(leave);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        public async ValueTask<bool> Update(long id, LeaveRequestDto dto)
        {
            try
            {
                var leave = await _leaveRepository
                    .FindByCondition(x => x.LeaveRequestID == id)
                    .FirstOrDefaultAsync();

                if (leave == null)
                    return false;

                leave.LeaveType = dto.LeaveType;
                leave.FromDate = dto.FromDate;
                leave.ToDate = dto.ToDate;
                leave.Reason = dto.Reason;
                leave.Status = dto.Status;

                await _leaveRepository.UpdateAsync(leave);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        public async ValueTask<bool> Delete(long id)
        {
            try
            {
                var leave = await _leaveRepository
                    .FindByCondition(x => x.LeaveRequestID == id)
                    .FirstOrDefaultAsync();

                if (leave == null)
                    return false;

                await _leaveRepository.DeleteAsync(leave);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }
    }
}