using Azure.Storage.Queues;
using MilkManagementSystem.WebJob;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton(x =>
{
    var connectionString = builder.Configuration["QueueSettings:ConnectionString"];
    return new QueueServiceClient(connectionString);
});

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();