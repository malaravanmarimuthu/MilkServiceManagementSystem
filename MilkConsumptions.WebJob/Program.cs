using Common.Queue;
using Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MilkConsumptions.WebJob;

var builder = Host.CreateApplicationBuilder(args);

// Load appsettings.json
builder.Configuration
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Read Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine("==========================================");
Console.WriteLine($"DefaultConnection : {connectionString}");
Console.WriteLine("==========================================");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new Exception("DefaultConnection is NULL or EMPTY. Check appsettings.json.");
}

// Register DbContext
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)));

// Register Queue Service
builder.Services.AddSingleton<IJobQueueService, AzureQueueJobService>();

// Register Worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();

await host.RunAsync();