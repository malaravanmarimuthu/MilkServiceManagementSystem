using Data.Context;
using Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models.Dto;
using System;

namespace MilkManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public PaymentController(AuthDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _context.Payments
                .Include(p => p.Employee)
                .Select(p => new PaymentDto
                {
                    PaymentID = p.PaymentID,
                    EmployeeID = p.EmployeeID,
                    EmployeeName = p.Employee != null
                        ? p.Employee.FirstName + " " + p.Employee.LastName
                        : "",
                    MilkEntryID = p.MilkEntryID,
                    Quantity = p.Quantity,
                    RatePerLiter = p.RatePerLiter,
                    TotalAmount = p.TotalAmount,
                    PaidDate = p.PaidDate,
                })
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentDto dto)
        {
            var payment = new Payment
            {
                EmployeeID = dto.EmployeeID,
                MilkEntryID = dto.MilkEntryID,
                Quantity = dto.Quantity,
                RatePerLiter = dto.RatePerLiter,
                TotalAmount = dto.TotalAmount,
                PaidDate = dto.PaidDate,
                CreatedAt = DateTime.Now,
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return Ok(payment);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PaymentDto dto)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
            {
                payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.EmployeeID == id
                        && p.PaidDate.Date == dto.PaidDate.Date);
            }

            if (payment == null)
                return NotFound($"No payment found for id={id} (tried as PaymentID and EmployeeID+Date).");

            payment.EmployeeID = dto.EmployeeID;
            payment.MilkEntryID = dto.MilkEntryID;
            payment.Quantity = dto.Quantity;
            payment.RatePerLiter = dto.RatePerLiter;
            payment.TotalAmount = dto.TotalAmount;
            payment.PaidDate = dto.PaidDate;

            await _context.SaveChangesAsync();
            return Ok(payment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}