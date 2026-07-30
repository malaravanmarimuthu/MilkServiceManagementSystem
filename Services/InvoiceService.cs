using Data.Context;
using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using Models.Models;

public class InvoiceService : IInvoiceService
{
    private readonly AuthDbContext _db;

    public InvoiceService(AuthDbContext db)
    {
        _db = db;
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest req)
    {
        DateTime fromDate;
        DateTime toDate;
        string label;
        bool isRangeMode = req.FromDate.HasValue && req.ToDate.HasValue;

        if (isRangeMode)
        {
            fromDate = req.FromDate!.Value.Date;
            toDate = req.ToDate!.Value.Date;

            if (toDate < fromDate)
                throw new Exception("'To Date' cannot be before 'From Date'.");

            label = $"{fromDate:dd MMM yyyy} - {toDate:dd MMM yyyy}";
        }
        else
        {
            if (string.IsNullOrWhiteSpace(req.MonthYear) ||
                !DateTime.TryParseExact(
                    req.MonthYear + "-01",
                    "yyyy-MM-dd",
                    null,
                    System.Globalization.DateTimeStyles.None,
                    out DateTime parsedDate))
            {
                throw new Exception($"Invalid MonthYear format: '{req.MonthYear}'. Use YYYY-MM (e.g. 2026-06)");
            }

            fromDate = new DateTime(parsedDate.Year, parsedDate.Month, 1);
            toDate = fromDate.AddMonths(1).AddDays(-1);
            label = fromDate.ToString("MMMM yyyy");
        }

        var emp = await _db.Employees.FindAsync(req.EmployeeID)
            ?? throw new Exception("Employee not found");

        bool alreadyExists = isRangeMode
            ? await _db.Invoices.AnyAsync(i =>
                i.EmployeeID == req.EmployeeID &&
                i.FromDate == fromDate &&
                i.ToDate == toDate)
            : await _db.Invoices.AnyAsync(i =>
                i.EmployeeID == req.EmployeeID &&
                i.MonthYear == label);

        if (alreadyExists)
            throw new Exception($"Invoice already exists for {emp.FirstName} {emp.LastName} for {label}");

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
            MonthYear = label,
            FromDate = fromDate,
            ToDate = toDate,
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
                    FromDate = fromDate,
                    ToDate = toDate,
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
            var (lastQty, lastAmt) = ComputeLastPeriod(i, allMilkEntries, allInvoicesForTheseEmployees);

            result.Add(new InvoiceDto
            {
                InvoiceID = i.InvoiceID,
                InvoiceNumber = i.InvoiceNumber,
                EmployeeID = i.EmployeeID,
                EmployeeName = i.EmployeeName,
                GeneratedDate = i.GeneratedDate.ToString("dd-MM-yyyy"),
                MonthYear = i.MonthYear,
                FromDate = i.FromDate.ToString("dd-MM-yyyy"),
                ToDate = i.ToDate.ToString("dd-MM-yyyy"),
                TotalQuantity = i.TotalQuantity,
                RatePerLitre = i.RatePerLitre,
                TotalAmount = i.TotalAmount,
                PreviousArrears = i.PreviousArrears,
                AmountPaid = i.AmountPaid,
                BalanceDue = i.BalanceDue,
                Status = i.Status,
                Notes = i.Notes,
                LastMonthQuantity = lastQty,
                LastMonthAmount = lastAmt
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

    // Deleting an invoice also removes its linked payments (bug fix — previously
    // these were left behind and silently inflated later arrears calculations).
    public async Task<bool> DeleteAsync(long id)
    {
        var inv = await _db.Invoices.FindAsync(id);
        if (inv == null) return false;

        var linkedPayments = await _db.Payments
            .Where(p => p.InvoiceID == id)
            .ToListAsync();

        if (linkedPayments.Count > 0)
            _db.Payments.RemoveRange(linkedPayments);

        _db.Invoices.Remove(inv);
        await _db.SaveChangesAsync();
        return true;
    }

    // ---------- Payment history (per invoice) ----------

    public async Task<List<PaymentEntryDto>> GetPaymentsAsync(long invoiceId)
    {
        var payments = await _db.Payments
            .Where(p => p.InvoiceID == invoiceId)
            .OrderByDescending(p => p.PaidDate)
            .ThenByDescending(p => p.PaymentID)
            .ToListAsync();

        return payments.Select(p => new PaymentEntryDto
        {
            PaymentID = p.PaymentID,
            InvoiceID = invoiceId,
            Amount = p.TotalAmount,
            PaidDate = p.PaidDate.ToString("dd-MM-yyyy")
        }).ToList();
    }

    // Adds a NEW payment entry and ADDS it on top of AmountPaid
    // — "kudutha 50 add aagum" behaviour.
    public async Task<InvoiceDto> AddPaymentAsync(long invoiceId, AddPaymentRequest req)
    {
        if (req.Amount <= 0)
            throw new Exception("Payment amount must be greater than zero.");

        var invoice = await _db.Invoices.FindAsync(invoiceId)
            ?? throw new Exception("Invoice not found.");

        var payment = new Payment
        {
            EmployeeID = (int)invoice.EmployeeID,
            InvoiceID = invoice.InvoiceID,
            MilkEntryID = null,
            Quantity = null,
            RatePerLiter = null,
            TotalAmount = req.Amount,
            PaidDate = req.PaidDate ?? DateTime.Today,
            CreatedAt = DateTime.Now
        };
        _db.Payments.Add(payment);

        invoice.AmountPaid += req.Amount;
        RecalculateInvoice(invoice);

        await _db.SaveChangesAsync();
        return await MapDtoAsync(invoice);
    }

    // Edits one existing payment entry's amount/date.
    public async Task<InvoiceDto> UpdatePaymentEntryAsync(long paymentId, UpdatePaymentEntryRequest req)
    {
        if (req.Amount <= 0)
            throw new Exception("Payment amount must be greater than zero.");

        var payment = await _db.Payments.FindAsync((int)paymentId)
            ?? throw new Exception("Payment entry not found.");

        if (payment.InvoiceID == null)
            throw new Exception("This payment isn't linked to an invoice and can't be edited here.");

        var invoice = await _db.Invoices.FindAsync(payment.InvoiceID.Value)
            ?? throw new Exception("Invoice not found.");

        invoice.AmountPaid -= payment.TotalAmount;

        payment.TotalAmount = req.Amount;
        if (req.PaidDate.HasValue) payment.PaidDate = req.PaidDate.Value;

        invoice.AmountPaid += payment.TotalAmount;
        RecalculateInvoice(invoice);

        await _db.SaveChangesAsync();
        return await MapDtoAsync(invoice);
    }

    // Deletes one payment entry and subtracts it back out of AmountPaid.
    public async Task<InvoiceDto> DeletePaymentEntryAsync(long paymentId)
    {
        var payment = await _db.Payments.FindAsync((int)paymentId)
            ?? throw new Exception("Payment entry not found.");

        if (payment.InvoiceID == null)
            throw new Exception("This payment isn't linked to an invoice and can't be deleted here.");

        var invoice = await _db.Invoices.FindAsync(payment.InvoiceID.Value)
            ?? throw new Exception("Invoice not found.");

        invoice.AmountPaid -= payment.TotalAmount;
        if (invoice.AmountPaid < 0) invoice.AmountPaid = 0;

        _db.Payments.Remove(payment);
        RecalculateInvoice(invoice);

        await _db.SaveChangesAsync();
        return await MapDtoAsync(invoice);
    }

    // ---------- Arrears (manual override) ----------

    public async Task<InvoiceDto> UpdateArrearsAsync(long invoiceId, decimal previousArrears)
    {
        if (previousArrears < 0)
            throw new Exception("Previous arrears cannot be negative.");

        var invoice = await _db.Invoices.FindAsync(invoiceId)
            ?? throw new Exception("Invoice not found.");

        invoice.PreviousArrears = previousArrears;
        RecalculateInvoice(invoice);

        await _db.SaveChangesAsync();
        return await MapDtoAsync(invoice);
    }

    private void RecalculateInvoice(Invoice invoice)
    {
        var grandTotal = invoice.TotalAmount + invoice.PreviousArrears;
        invoice.BalanceDue = grandTotal - invoice.AmountPaid;
        invoice.Status = invoice.BalanceDue <= 0
            ? "Paid"
            : invoice.AmountPaid > 0
                ? "Partial"
                : "Unpaid";
    }

    private async Task<InvoiceDto> MapDtoAsync(Invoice i)
    {
        var allMilkEntries = await _db.MilkEntries
            .Where(e => e.EmployeeID == i.EmployeeID)
            .ToListAsync();

        var allInvoicesForEmp = await _db.Invoices
            .Where(x => x.EmployeeID == i.EmployeeID)
            .ToListAsync();

        var (lastQty, lastAmt) = ComputeLastPeriod(i, allMilkEntries, allInvoicesForEmp);

        return new InvoiceDto
        {
            InvoiceID = i.InvoiceID,
            InvoiceNumber = i.InvoiceNumber,
            EmployeeID = i.EmployeeID,
            EmployeeName = i.EmployeeName,
            GeneratedDate = i.GeneratedDate.ToString("dd-MM-yyyy"),
            MonthYear = i.MonthYear,
            FromDate = i.FromDate.ToString("dd-MM-yyyy"),
            ToDate = i.ToDate.ToString("dd-MM-yyyy"),
            TotalQuantity = i.TotalQuantity,
            RatePerLitre = i.RatePerLitre,
            TotalAmount = i.TotalAmount,
            PreviousArrears = i.PreviousArrears,
            AmountPaid = i.AmountPaid,
            BalanceDue = i.BalanceDue,
            Status = i.Status,
            Notes = i.Notes,
            LastMonthQuantity = lastQty,
            LastMonthAmount = lastAmt
        };
    }

    private (decimal Qty, decimal Amount) ComputeLastPeriod(
        Invoice invoice,
        List<MilkEntry> allMilkEntries,
        List<Invoice> allInvoicesForEmp)
    {
        try
        {
            var previousInvoice = allInvoicesForEmp
                .Where(x => x.InvoiceID != invoice.InvoiceID && x.ToDate < invoice.FromDate)
                .OrderByDescending(x => x.ToDate)
                .FirstOrDefault();

            if (previousInvoice != null)
            {
                return (previousInvoice.TotalQuantity, previousInvoice.TotalAmount);
            }

            var fromDate = invoice.FromDate.Date;
            var toDate = invoice.ToDate.Date;

            if (toDate < fromDate)
                return (0, 0);

            var periodLengthDays = (toDate - fromDate).Days + 1;

            var roomBeforeFromDate = fromDate - DateTime.MinValue;
            if (roomBeforeFromDate < TimeSpan.FromDays(periodLengthDays))
            {
                return (0, 0);
            }

            var lastPeriodTo = fromDate.AddDays(-1);
            var lastPeriodFrom = lastPeriodTo.AddDays(-(periodLengthDays - 1));

            var qty = allMilkEntries
                .Where(e => e.EmployeeID == invoice.EmployeeID
                    && e.EntryDate >= lastPeriodFrom
                    && e.EntryDate <= lastPeriodTo)
                .Sum(e => e.Quantity);

            var amount = qty * invoice.RatePerLitre;
            return (qty, amount);
        }
        catch (ArgumentOutOfRangeException)
        {
            return (0, 0);
        }
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