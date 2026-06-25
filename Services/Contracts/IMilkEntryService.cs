using Models.Dto;



namespace Services.Contracts
{
    public interface IMilkEntryService
    {
        ValueTask<List<MilkEntryDto>> GetAll();
        ValueTask<bool> Create(MilkEntryDto dto);
        ValueTask<bool> Delete(long id);
    }
}
