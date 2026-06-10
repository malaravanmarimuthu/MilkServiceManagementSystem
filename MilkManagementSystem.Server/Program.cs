using Common.Settings;
using Data.Base;
using Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Services;
using Services.Contracts;


var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString = builder.Configuration.GetConnectionString("DB_Sql");
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

//// Repository register
//builder.Services.AddScoped(typeof(IRepositary<>), typeof(Repository<>));

//// Services register
//ServicesDIConfig.AddBLServices(builder.Services);

// Controllers
builder.Services.AddControllers();
builder.Services.AddBLServices();
builder.Services.AddDALServices();
builder.Services.AddDbContext(builder.Configuration);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthAPI:AuthSettings"));

builder.Services.AddSingleton<IAuthSettings>(sp =>
    sp.GetRequiredService<IOptions<AuthSettings>>().Value);

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