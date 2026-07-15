using Data.Context;
using Microsoft.EntityFrameworkCore;


var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();