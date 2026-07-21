using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Models.Models;

namespace Data.Context
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<EmployeeSubscription> EmployeeSubscriptions { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<MilkEntry> MilkEntries { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<ProcurementRate> ProcurementRates { get; set; }
        public DbSet<ProcurementEntry> ProcurementEntries { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<LookupMaster> LookupMasters { get; set; }


    }
}