using Data.Context;
using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Models.Dto;

public class InvoiceService : IInvoiceService
{
    private readonly AuthDbContext _db;

    public InvoiceService(AuthDbContext db)
    {
        _db = db;
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest req)
    {
        if (!DateTime.TryParseExact(
                req.MonthYear + "-01",
                "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out DateTime parsedDate))
        {
            throw new Exception($"Invalid MonthYear format: '{req.MonthYear}'. Use YYYY-MM (e.g. 2026-06)");
        }

        var fromDate = new DateTime(parsedDate.Year, parsedDate.Month, 1);
        var toDate = fromDate.AddMonths(1).AddDays(-1);

        var emp = await _db.Employees.FindAsync(req.EmployeeID)
            ?? throw new Exception("Employee not found");

        var entries = await _db.MilkEntries
            .Where(c => c.EmployeeID == req.EmployeeID
                && c.EntryDate >= fromDate
                && c.EntryDate <= toDate)
            .ToListAsync();

        var totalQty = entries.Sum(c => c.Quantity);

        var empSub = await _db.EmployeeSubscriptions
            .Include(s => s.Subscription)
            .Where(s => s.EmployeeId == req.EmployeeID
                && s.Status == "Active")
            .FirstOrDefaultAsync();

        var rate = empSub?.Subscription?.PricePerLiter ?? 0;
        var totalAmt = totalQty * rate;

        var paid = await _db.Payments
            .Where(p => p.EmployeeID == req.EmployeeID
                && p.PaidDate >= fromDate
                && p.PaidDate <= toDate)
            .SumAsync(p => (decimal?)p.TotalAmount) ?? 0;

        var previousArrears = req.PreviousArrears;

        var grandTotal = totalAmt + previousArrears;
        var balance = grandTotal - paid;

        var invoice = new Invoice
        {
            InvoiceNumber = GenerateInvoiceNumber(),
            EmployeeID = req.EmployeeID,
            EmployeeName = $"{emp.FirstName} {emp.LastName}".Trim(),
            GeneratedDate = DateTime.Today,

            MonthYear = fromDate.ToString("MMMM yyyy", System.Globalization.CultureInfo.InvariantCulture),
            TotalQuantity = totalQty,
            RatePerLitre = rate,
            TotalAmount = totalAmt,
            PreviousArrears = previousArrears,
            AmountPaid = paid,
            BalanceDue = balance,
            Status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
            Notes = req.Notes
        };

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return MapDto(invoice);
    }

    private string GenerateInvoiceNumber()
    {
        var year = DateTime.Now.Year;
        var count = _db.Invoices.Count(i => i.GeneratedDate.Year == year) + 1;
        return $"INV-{year}-{count:D4}";
    }

    public async Task<List<InvoiceDto>> GetAllAsync() =>
        await _db.Invoices
            .OrderByDescending(i => i.GeneratedDate)
            .Select(i => MapDto(i))
            .ToListAsync();

    public async Task<InvoiceDto?> GetByIdAsync(long id)
    {
        var inv = await _db.Invoices.FindAsync(id);
        return inv == null ? null : MapDto(inv);
    }

    public async Task<List<InvoiceDto>> GetByEmployeeAsync(long empId) =>
        await _db.Invoices
            .Where(i => i.EmployeeID == empId)
            .OrderByDescending(i => i.GeneratedDate)
            .Select(i => MapDto(i))
            .ToListAsync();

    public async Task<bool> DeleteAsync(long id)
    {
        var inv = await _db.Invoices.FindAsync(id);
        if (inv == null) return false;

        _db.Invoices.Remove(inv);
        await _db.SaveChangesAsync();
        return true;
    }

    private static InvoiceDto MapDto(Invoice i) => new()
    {
        InvoiceID = i.InvoiceID,
        InvoiceNumber = i.InvoiceNumber,
        EmployeeID = i.EmployeeID,
        EmployeeName = i.EmployeeName,
        GeneratedDate = i.GeneratedDate.ToString("dd-MM-yyyy"),
        MonthYear = i.MonthYear,
        TotalQuantity = i.TotalQuantity,
        RatePerLitre = i.RatePerLitre,
        TotalAmount = i.TotalAmount,
        PreviousArrears = i.PreviousArrears,
        AmountPaid = i.AmountPaid,
        BalanceDue = i.BalanceDue,
        Status = i.Status,
        Notes = i.Notes
    };

    public async Task<decimal> GetLastBalanceAsync(long empId)
    {
        var lastInvoice = await _db.Invoices
            .Where(i => i.EmployeeID == empId)
            .OrderByDescending(i => i.GeneratedDate)
            .FirstOrDefaultAsync();

        decimal baseBalance = lastInvoice?.BalanceDue ?? 0;

        try
        {
            DateTime scanFrom;

            if (lastInvoice != null)
            {
                if (!DateTime.TryParseExact(
                        lastInvoice.MonthYear, "MMMM yyyy",
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None,
                        out DateTime lastInvoiceMonth))
                {
                    return baseBalance;
                }

                scanFrom = new DateTime(lastInvoiceMonth.Year, lastInvoiceMonth.Month, 1).AddMonths(1);
            }
            else
            {

                var firstEntry = await _db.MilkEntries
                    .Where(m => m.EmployeeID == empId)
                    .OrderBy(m => m.EntryDate)
                    .FirstOrDefaultAsync();

                if (firstEntry == null)
                    return baseBalance;

                scanFrom = new DateTime(firstEntry.EntryDate.Year, firstEntry.EntryDate.Month, 1);
            }

            var currentMonthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);

            if (scanFrom >= currentMonthStart)
                return baseBalance; 

            var empSub = await _db.EmployeeSubscriptions
                .Include(s => s.Subscription)
                .Where(s => s.EmployeeId == empId && s.Status == "Active")
                .FirstOrDefaultAsync();
            var rate = empSub?.Subscription?.PricePerLiter ?? 0;

            decimal unbilledArrears = 0;
            var monthCursor = scanFrom;

            while (monthCursor < currentMonthStart)
            {
                var monthEnd = monthCursor.AddMonths(1).AddDays(-1);

                var monthQty = await _db.MilkEntries
                    .Where(m => m.EmployeeID == empId
                        && m.EntryDate >= monthCursor
                        && m.EntryDate <= monthEnd)
                    .SumAsync(m => (decimal?)m.Quantity) ?? 0;

                var monthBill = monthQty * rate;

                var monthPaid = await _db.Payments
                    .Where(p => p.EmployeeID == empId
                        && p.PaidDate >= monthCursor
                        && p.PaidDate <= monthEnd)
                    .SumAsync(p => (decimal?)p.TotalAmount) ?? 0;

                unbilledArrears += (monthBill - monthPaid);

                monthCursor = monthCursor.AddMonths(1);
            }

            return baseBalance + unbilledArrears;
        }
        catch
        {
            return baseBalance;
        }
    }
}