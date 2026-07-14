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

        var monthLabel = fromDate.ToString("MMMM yyyy");
        var alreadyExists = await _db.Invoices
            .AnyAsync(i => i.EmployeeID == req.EmployeeID && i.MonthYear == monthLabel);
        if (alreadyExists)
        {
            throw new Exception($"Invoice already exists for {emp.FirstName} {emp.LastName} for {monthLabel}");
        }

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
            MonthYear = monthLabel,
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

    public async Task<BulkInvoiceResultDto> CreateAllAsync(string monthYear)
    {
        var result = new BulkInvoiceResultDto();

        if (!DateTime.TryParseExact(
                monthYear + "-01", "yyyy-MM-dd", null,
                System.Globalization.DateTimeStyles.None,
                out DateTime parsedDate))
        {
            throw new Exception($"Invalid MonthYear format: '{monthYear}'. Use YYYY-MM (e.g. 2026-06)");
        }

        var fromDate = new DateTime(parsedDate.Year, parsedDate.Month, 1);
        var toDate = fromDate.AddMonths(1).AddDays(-1);
        var monthLabel = fromDate.ToString("MMMM yyyy");

        // Fetch EVERYTHING once, up front
        var employees = await _db.Employees.ToListAsync();

        var existingInvoiceEmpIds = await _db.Invoices
            .Where(i => i.MonthYear == monthLabel)
            .Select(i => i.EmployeeID)
            .ToHashSetAsync();

        var allMilkEntries = await _db.MilkEntries
            .Where(e => e.EntryDate <= toDate)
            .ToListAsync();

        var allSubscriptions = await _db.EmployeeSubscriptions
            .Include(s => s.Subscription)
            .Where(s => s.Status == "Active")
            .ToListAsync();

        var allPayments = await _db.Payments.ToListAsync();

        var allInvoices = await _db.Invoices.ToListAsync();

        var newInvoices = new List<Invoice>();
        var year = DateTime.Now.Year;
        int invoiceCounter = _db.Invoices.Count(i => i.GeneratedDate.Year == year);

        foreach (var emp in employees)
        {
            if (existingInvoiceEmpIds.Contains(emp.ID))
            {
                result.SkippedCount++;
                continue;
            }

            try
            {
                var empEntries = allMilkEntries
                    .Where(e => e.EmployeeID == emp.ID && e.EntryDate >= fromDate && e.EntryDate <= toDate)
                    .ToList();
                var totalQty = empEntries.Sum(e => e.Quantity);

                var empSub = allSubscriptions.FirstOrDefault(s => s.EmployeeId == emp.ID);
                var rate = empSub?.Subscription?.PricePerLiter ?? 0;
                var totalAmt = totalQty * rate;

                var paid = allPayments
                    .Where(p => p.EmployeeID == emp.ID && p.PaidDate >= fromDate && p.PaidDate <= toDate)
                    .Sum(p => p.TotalAmount);

                // Pending balance calculated from in-memory data (no extra DB calls)
                var priorEntries = allMilkEntries.Where(e => e.EmployeeID == emp.ID && e.EntryDate < fromDate).ToList();
                var monthGroups = priorEntries
                    .GroupBy(e => new { e.EntryDate.Year, e.EntryDate.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Qty = g.Sum(x => x.Quantity) })
                    .ToList();

                var empInvoices = allInvoices.Where(i => i.EmployeeID == emp.ID).ToList();
                decimal totalBilled = 0;
                foreach (var g in monthGroups)
                {
                    var gLabel = new DateTime(g.Year, g.Month, 1).ToString("MMMM yyyy");
                    var matchingInvoice = empInvoices
                        .Where(inv => inv.MonthYear == gLabel)
                        .OrderByDescending(inv => inv.InvoiceID)
                        .FirstOrDefault();
                    totalBilled += matchingInvoice != null ? matchingInvoice.TotalAmount : g.Qty * rate;
                }

                var totalPaidBefore = allPayments
                    .Where(p => p.EmployeeID == emp.ID && p.PaidDate < fromDate)
                    .Sum(p => p.TotalAmount);

                var previousArrears = Math.Max(totalBilled - totalPaidBefore, 0);

                var grandTotal = totalAmt + previousArrears;
                var balance = grandTotal - paid;

                invoiceCounter++;
                var invoice = new Invoice
                {
                    InvoiceNumber = $"INV-{year}-{invoiceCounter:D4}",
                    EmployeeID = emp.ID,
                    EmployeeName = $"{emp.FirstName} {emp.LastName}".Trim(),
                    GeneratedDate = DateTime.Today,
                    MonthYear = monthLabel,
                    TotalQuantity = totalQty,
                    RatePerLitre = rate,
                    TotalAmount = totalAmt,
                    PreviousArrears = previousArrears,
                    AmountPaid = paid,
                    BalanceDue = balance,
                    Status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
                    Notes = ""
                };

                newInvoices.Add(invoice);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add($"{emp.FirstName} {emp.LastName} (#{emp.ID}): {ex.Message}");
            }
        }

        _db.Invoices.AddRange(newInvoices);
        await _db.SaveChangesAsync();

        return result;
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

        if (invoices.Count == 0) return new List<InvoiceDto>();

        // Fetch everything once
        var allEmployeeIds = invoices.Select(i => i.EmployeeID).Distinct().ToList();

        var allMilkEntries = await _db.MilkEntries
            .Where(e => allEmployeeIds.Contains(e.EmployeeID))
            .ToListAsync();

        var allInvoicesForTheseEmployees = await _db.Invoices
            .Where(i => allEmployeeIds.Contains(i.EmployeeID))
            .ToListAsync();

        var result = new List<InvoiceDto>();

        foreach (var i in invoices)
        {
            DateTime.TryParseExact(
                i.MonthYear, "MMMM yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out DateTime invoiceMonth);

            var lastMonthStart = invoiceMonth.AddMonths(-1);
            var lastMonthFrom = new DateTime(lastMonthStart.Year, lastMonthStart.Month, 1);
            var lastMonthTo = lastMonthFrom.AddMonths(1).AddDays(-1);
            var lastMonthLabel = lastMonthFrom.ToString("MMMM yyyy");

            var lastMonthQty = allMilkEntries
                .Where(e => e.EmployeeID == i.EmployeeID && e.EntryDate >= lastMonthFrom && e.EntryDate <= lastMonthTo)
                .Sum(e => e.Quantity);

            var lastMonthInvoice = allInvoicesForTheseEmployees
                .Where(x => x.EmployeeID == i.EmployeeID && x.MonthYear == lastMonthLabel)
                .OrderByDescending(x => x.InvoiceID)
                .FirstOrDefault();

            var lastMonthAmt = lastMonthInvoice != null
                ? lastMonthInvoice.TotalAmount
                : lastMonthQty * i.RatePerLitre;

            result.Add(new InvoiceDto
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
            });
        }

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

    public async Task<InvoiceDto> RecordPaymentAsync(long invoiceId, RecordPaymentRequest req)
    {
        if (req.Amount <= 0)
            throw new Exception("Payment amount must be greater than zero.");

        var invoice = await _db.Invoices.FindAsync(invoiceId)
            ?? throw new Exception("Invoice not found.");

        var paidDate = req.PaidDate ?? DateTime.Today;

        var payment = new Payment
        {
            EmployeeID = (int)invoice.EmployeeID,
            TotalAmount = req.Amount,
            PaidDate = paidDate,

        };
        _db.Payments.Add(payment);

        // Update the invoice itself
        invoice.AmountPaid += req.Amount;
        var grandTotal = invoice.TotalAmount + invoice.PreviousArrears;
        invoice.BalanceDue = grandTotal - invoice.AmountPaid;
        invoice.Status = invoice.BalanceDue <= 0
            ? "Paid"
            : invoice.AmountPaid > 0
                ? "Partial"
                : "Unpaid";

        await _db.SaveChangesAsync();

        return await MapDtoAsync(invoice);
    }

    public async Task<InvoiceDto> UpdatePaymentAsync(long invoiceId, UpdatePaymentRequest req)
    {
        if (req.TotalPaidAmount < 0)
            throw new Exception("Paid amount cannot be negative.");

        var invoice = await _db.Invoices.FindAsync(invoiceId)
            ?? throw new Exception("Invoice not found.");

        var paidDate = req.PaidDate ?? DateTime.Today;
        var delta = req.TotalPaidAmount - invoice.AmountPaid;

        if (delta != 0)
        {
            var payment = new Payment
            {
                EmployeeID = (int)invoice.EmployeeID,
                TotalAmount = delta,
                PaidDate = paidDate,

            };
            _db.Payments.Add(payment);
        }

        invoice.AmountPaid = req.TotalPaidAmount;
        var grandTotal = invoice.TotalAmount + invoice.PreviousArrears;
        invoice.BalanceDue = grandTotal - invoice.AmountPaid;
        invoice.Status = invoice.BalanceDue <= 0
            ? "Paid"
            : invoice.AmountPaid > 0
                ? "Partial"
                : "Unpaid";

        await _db.SaveChangesAsync();

        return await MapDtoAsync(invoice);
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