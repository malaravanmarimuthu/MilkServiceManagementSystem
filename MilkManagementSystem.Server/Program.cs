using Data.Context;
using Data.Base;
using Microsoft.EntityFrameworkCore;
using Services.Contracts;
using Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString = "server=localhost;database=anaiyaante_antechcmds;user=anaiyaante_antechCMDS;password=Anaiyaan@123";
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// Repository register

builder.Services.AddScoped(typeof(IRepositary<>), typeof(Repository<>));

// Services register
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();