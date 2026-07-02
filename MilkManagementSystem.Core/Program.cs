using api_authenticationservice;
using System.Text.Json.Serialization;
var corsPolicyName = "AllowAll";
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

var appInsights = builder.Configuration.GetValue<string>("AuthAPI:Serilog:AppInsights_Connection");
// Add Application Insights services to the container
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = appInsights;
});

builder.WebHost.ConfigureKestrel(serveroptions =>
{
    serveroptions.Limits.MaxRequestBodySize = long.MaxValue;
});

// Add services to the container.

#region Configure Services

Console.WriteLine("Started - Service Configuration");
//Serilog Configuration

builder.Host.ExtUseSerilog(builder.Configuration);

// Add services to the container.
builder.Services.ExtAddConfigureServices(builder.Configuration, true, true, true);

Console.WriteLine("Completed - Service Configuration");

builder.Services.AddHttpClient();
// Add Application Insights services
//builder.Services.AddApplicationInsightsTelemetry();
// Configure CORS
builder.Services.AddCors(options =>
{
   
    // Alternatively, a more permissive policy (use with caution in production)
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(origin => true)// Allows any origin
              ;
    });
});

#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
// Moved configure middleware logic into extension method.
app.ExtUseConfigureMiddleware(builder.Configuration, true, true);
app.UseHttpsRedirection();
// Enable CORS middleware, applying the named policy
app.UseCors(corsPolicyName); // Use the name of your defined policy
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
//app.MapHub<api_truckcompanyservice.Hubs.ChatHub>("/chatHub");
app.Run();
