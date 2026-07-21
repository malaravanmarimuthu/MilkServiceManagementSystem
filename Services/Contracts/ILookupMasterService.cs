using Models.Dto;

namespace Services.Contracts
{
    public interface ILookupMasterService
    {
        Task<LookupMaster> CreateAsync(LookupMasterDto dto);
        Task<LookupMaster?> UpdateAsync(int id, LookupMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
