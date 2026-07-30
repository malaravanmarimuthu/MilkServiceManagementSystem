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

    Task<List<PaymentEntryDto>> GetPaymentsAsync(long invoiceId);
    Task<InvoiceDto> AddPaymentAsync(long invoiceId, AddPaymentRequest req);
    Task<InvoiceDto> UpdatePaymentEntryAsync(long paymentId, UpdatePaymentEntryRequest req);
    Task<InvoiceDto> DeletePaymentEntryAsync(long paymentId);

    Task<InvoiceDto> UpdateArrearsAsync(long invoiceId, decimal previousArrears);
}