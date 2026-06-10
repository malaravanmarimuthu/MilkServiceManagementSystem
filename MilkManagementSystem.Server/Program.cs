using Common.Settings;
using Data.Base;
using Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Services;
using Services.Contracts;


var builder = WebApplication.CreateBuilder(args);

//// Database
//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");// "server =anaiyaantechnologies.com; port=3306; database=anaiyaante_antechCMDS; user=anaiyaante_antechCMDS; password=Anaiyaan@123; Persist Security Info=False; Connect Timeout=300";
//builder.Services.AddDbContext<AuthDbContext>(options =>
//    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
//);


ServicesDIConfig.AddDbContext(builder.Services, builder.Configuration);
// Services register
//ServicesDIConfig.AddMapster(builder.Services);
ServicesDIConfig.AddBLServices(builder.Services);
ServicesDIConfig.AddDALServices(builder.Services);

// Controllers
builder.Services.AddControllers();

// Swagger
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