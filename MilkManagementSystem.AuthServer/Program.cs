using api_authenticationservice;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.

#region Configure Services

Console.WriteLine("Started - Service Configuration");
//Serilog Configuration

builder.Host.ExtUseSerilog(builder.Configuration);

// Add services to the container.
builder.Services.ExtAddConfigureServices(builder.Configuration, true, true, true);

Console.WriteLine("Completed - Service Configuration");

#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
// Moved configure middleware logic into extension method.
app.ExtUseConfigureMiddleware(builder.Configuration, true, true);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
