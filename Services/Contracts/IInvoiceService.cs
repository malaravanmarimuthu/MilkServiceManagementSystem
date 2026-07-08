using Models.Dto;

public interface IInvoiceService
{
    Task<List<InvoiceDto>> GetAllAsync();
    Task<InvoiceDto?> GetByIdAsync(long id);
    Task<List<InvoiceDto>> GetByEmployeeAsync(long empId);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest req);
    Task<bool> DeleteAsync(long id);
    Task<decimal> GetLastBalanceAsync(long empId);
    Task<BulkInvoiceResultDto> CreateAllAsync(string monthYear);
}