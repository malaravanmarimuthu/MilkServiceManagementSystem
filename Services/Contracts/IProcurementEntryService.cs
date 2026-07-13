using Models.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Contracts
{
    public interface IProcurementEntryService
    {
        Task<List<ProcurementEntryDto>> GetAllAsync();
        Task<ProcurementEntryDto> AddAsync(ProcurementEntryDto dto);
        Task<ProcurementEntryDto> UpdateAsync(ProcurementEntryDto dto);
        Task DeleteAsync(int id);
    }
}
