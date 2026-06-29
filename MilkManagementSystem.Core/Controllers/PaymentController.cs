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
    }
}