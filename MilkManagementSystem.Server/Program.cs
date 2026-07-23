using Common.Queue;
using Common.Settings;
using Microsoft.Extensions.Options;
using Services;
using Azure.Storage.Queues;

var builder = WebApplication.CreateBuilder(args);

try
{
    // Database
    ServicesDIConfig.AddDbContext(builder.Services, builder.Configuration);

    // Services register
    ServicesDIConfig.AddBLServices(builder.Services);
    ServicesDIConfig.AddDALServices(builder.Services);
}
catch (Exception ex)
{
    Console.WriteLine($"[STARTUP ERROR - DI/DB] {ex}");
    throw;
}

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddSingleton<QueueService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "4K Fresh"
    });
});

builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthAPI:AuthSettings"));

builder.Services.AddSingleton<IAuthSettings>(sp =>
    sp.GetRequiredService<IOptions<AuthSettings>>().Value);

// Azure Storage Queue Client Register
try
{
    builder.Services.AddSingleton(x =>
    {
        var config = x.GetRequiredService<IConfiguration>();
        var connStr = config["AzureStorage:ConnectionString"];
        var queueName = config["AzureStorage:QueueName"];

        if (string.IsNullOrWhiteSpace(connStr) || string.IsNullOrWhiteSpace(queueName))
        {
            Console.WriteLine("[STARTUP WARNING] AzureStorage config missing - QueueClient not created properly.");
        }

        return new QueueClient(connStr, queueName);
    });
}
catch (Exception ex)
{
    Console.WriteLine($"[STARTUP ERROR - QueueClient] {ex}");
    throw;
}
builder.Services.Configure<AzureBlobSettings>(
    builder.Configuration.GetSection("AzureBlob"));

var app = builder.Build();

app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var ex = feature?.Error;

        Console.WriteLine($"[UNHANDLED EXCEPTION] {ex}");

        await context.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(new
            {
                error = "Internal Server Error",
                message = ex?.Message
            }));
    });
});

// Order matters!
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "4K Fresh");
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();