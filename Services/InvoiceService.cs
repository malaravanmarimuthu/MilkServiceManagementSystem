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
                null,
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

        var previousArrears = await CalculatePendingBalanceAsync(req.EmployeeID, fromDate);

        var grandTotal = totalAmt + previousArrears;
        var balance = grandTotal - paid;

        var invoice = new Invoice
        {
            InvoiceNumber = GenerateInvoiceNumber(),
            EmployeeID = req.EmployeeID,
            EmployeeName = $"{emp.FirstName} {emp.LastName}".Trim(),
            GeneratedDate = DateTime.Today,
            MonthYear = fromDate.ToString("MMMM yyyy"),
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
        return await MapDtoAsync(invoice);
    }

    private string GenerateInvoiceNumber()
    {
        var year = DateTime.Now.Year;
        var count = _db.Invoices.Count(i => i.GeneratedDate.Year == year) + 1;
        return $"INV-{year}-{count:D4}";
    }

    public async Task<List<InvoiceDto>> GetAllAsync()
    {
        var invoices = await _db.Invoices
            .OrderByDescending(i => i.GeneratedDate)
            .ThenByDescending(i => i.InvoiceID)
            .ToListAsync();

        var result = new List<InvoiceDto>();
        foreach (var inv in invoices)
            result.Add(await MapDtoAsync(inv));

        return result;
    }

    public async Task<InvoiceDto?> GetByIdAsync(long id)
    {
        var inv = await _db.Invoices.FindAsync(id);
        return inv == null ? null : await MapDtoAsync(inv);
    }

    public async Task<List<InvoiceDto>> GetByEmployeeAsync(long empId)
    {
        var invoices = await _db.Invoices
            .Where(i => i.EmployeeID == empId)
            .OrderByDescending(i => i.GeneratedDate)
            .ThenByDescending(i => i.InvoiceID)
            .ToListAsync();

        var result = new List<InvoiceDto>();
        foreach (var inv in invoices)
            result.Add(await MapDtoAsync(inv));

        return result;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var inv = await _db.Invoices.FindAsync(id);
        if (inv == null) return false;

        _db.Invoices.Remove(inv);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task<InvoiceDto> MapDtoAsync(Invoice i)
    {
        DateTime.TryParseExact(
            i.MonthYear,
            "MMMM yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None,
            out DateTime invoiceMonth);

        var lastMonthStart = invoiceMonth.AddMonths(-1);
        var lastMonthFrom = new DateTime(lastMonthStart.Year, lastMonthStart.Month, 1);
        var lastMonthTo = lastMonthFrom.AddMonths(1).AddDays(-1);

        var lastMonthEntries = await _db.MilkEntries
            .Where(e => e.EmployeeID == i.EmployeeID
                && e.EntryDate >= lastMonthFrom
                && e.EntryDate <= lastMonthTo)
            .ToListAsync();

        var lastMonthQty = lastMonthEntries.Sum(e => e.Quantity);

        var lastMonthInvoice = await _db.Invoices
            .Where(x => x.EmployeeID == i.EmployeeID
                && x.MonthYear == lastMonthFrom.ToString("MMMM yyyy"))
            .OrderByDescending(x => x.InvoiceID)
            .FirstOrDefaultAsync();

        var lastMonthAmt = lastMonthInvoice != null
            ? lastMonthInvoice.TotalAmount
            : lastMonthQty * i.RatePerLitre;

        return new InvoiceDto
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
            Notes = i.Notes,
            LastMonthQuantity = lastMonthQty,
            LastMonthAmount = lastMonthAmt
        };
    }

    public async Task<decimal> GetLastBalanceAsync(long empId) =>
        await CalculatePendingBalanceAsync(empId, DateTime.MaxValue);


    private async Task<decimal> CalculatePendingBalanceAsync(long empId, DateTime beforeDate)
    {
        var priorEntries = await _db.MilkEntries
            .Where(e => e.EmployeeID == empId && e.EntryDate < beforeDate)
            .ToListAsync();

        var monthGroups = priorEntries
            .GroupBy(e => new { e.EntryDate.Year, e.EntryDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Qty = g.Sum(x => x.Quantity) })
            .ToList();

        var empSub = await _db.EmployeeSubscriptions
            .Include(s => s.Subscription)
            .Where(s => s.EmployeeId == empId && s.Status == "Active")
            .FirstOrDefaultAsync();
        var currentRate = empSub?.Subscription?.PricePerLiter ?? 0;

        var invoicesForEmp = await _db.Invoices
            .Where(i => i.EmployeeID == empId)
            .ToListAsync();

        decimal totalBilled = 0;
        foreach (var g in monthGroups)
        {
            var monthLabel = new DateTime(g.Year, g.Month, 1).ToString("MMMM yyyy");
            var matchingInvoice = invoicesForEmp
                .Where(inv => inv.MonthYear == monthLabel)
                .OrderByDescending(inv => inv.InvoiceID)
                .FirstOrDefault();

            totalBilled += matchingInvoice != null
                ? matchingInvoice.TotalAmount
                : g.Qty * currentRate;
        }

        var totalPaid = await _db.Payments
            .Where(p => p.EmployeeID == empId && p.PaidDate < beforeDate)
            .SumAsync(p => (decimal?)p.TotalAmount) ?? 0;

        var balance = totalBilled - totalPaid;
        return balance > 0 ? balance : 0;
    }
}