using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Contracts
{
    public interface ILeaveRequestService
    {
        ValueTask<List<LeaveRequestDto>> GetAll();
        ValueTask<LeaveRequestDto> GetById(long id);
        ValueTask<bool> Create(LeaveRequestDto dto);
        ValueTask<bool> Update(long id, LeaveRequestDto dto);
        ValueTask<bool> Delete(long id);
    }
}
