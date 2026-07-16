public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public Worker(ILogger<Worker> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;

            if (now.Day == 1 && now.Hour == 5 && now.Minute == 0)
            {
                _logger.LogInformation($"Invoice generation started at {now}");

                using var scope = _scopeFactory.CreateScope();
                var invoiceService = scope.ServiceProvider.GetRequiredService<IInvoiceService>();

                try
                {
                    
                    var monthYear = now.AddMonths(-1).ToString("yyyy-MM");
                    var result = await invoiceService.CreateAllAsync(monthYear);

                    _logger.LogInformation(
                        $"Done: {result.SuccessCount} created, {result.SkippedCount} skipped, {result.FailedCount} failed.");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Invoice generation failed: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromSeconds(61), stoppingToken);
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}