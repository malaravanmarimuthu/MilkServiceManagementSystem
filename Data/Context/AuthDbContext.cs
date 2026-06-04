using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
namespace Data.Context
{
    public  class AuthDbContext : DbContext
    {
        private readonly IConfiguration _configuration;
        public AuthDbContext(IConfiguration configuration) : base()
        {
            _configuration = configuration;
        }

        public AuthDbContext(DbContextOptions<AuthDbContext> options, IConfiguration configuration) : base(options)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //To DO: Need to add Seed valies to Database 
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

           //To DO : Fluent API regoistration for Relationship Mappings
        }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Organization> Organizations { get; set; }
    }
}
