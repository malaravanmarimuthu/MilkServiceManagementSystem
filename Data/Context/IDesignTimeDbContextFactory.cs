using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Data.Context
{
    public class AuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
    {
        public AuthDbContext CreateDbContext(string[] args)
        {
            var connectionString = "server=anaiyaantechnologies.com; port=3306; database=anaiyaante_antechCMDS; user=anaiyaante_antechCMDS; password=Anaiyaan@123; Persist Security Info=False; Connect Timeout=300";

            var optionsBuilder = new DbContextOptionsBuilder<AuthDbContext>();
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new AuthDbContext(optionsBuilder.Options);
        }
    }
}