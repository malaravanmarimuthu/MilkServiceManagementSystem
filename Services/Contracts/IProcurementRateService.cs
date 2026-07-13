using Models.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Contracts
{
    public interface IProcurementRateService
    {
        Task<List<ProcurementRateDto>> GetAllAsync();
        Task<ProcurementRateDto> AddAsync(ProcurementRateDto dto);
        Task<ProcurementRateDto> UpdateAsync(ProcurementRateDto dto);
        Task DeleteAsync(int id);
        Task<decimal> GetRateByMilkTypeAsync(string milkType);
    }
}
