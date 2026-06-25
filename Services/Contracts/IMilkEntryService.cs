using Models.Dto;



namespace Services.Contracts
{
    public interface IMilkEntryService
    {
        ValueTask<List<MilkEntryDto>> GetAll();
        ValueTask<MilkEntryDto> GetById(long id);
        ValueTask<bool> Create(MilkEntryDto dto);
        ValueTask<bool> Update(long id,MilkEntryDto dto);
        ValueTask<bool> Delete(long id);
    }
}
