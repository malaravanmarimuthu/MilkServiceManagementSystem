using Common.Queue;
using Data;
using Data.Context;
using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Models.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MilkConsumptions.WebJob
{
    public class Worker : BackgroundService
    {
        private readonly IJobQueueService _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<Worker> _logger;
        private readonly int _pollingIntervalSeconds;

        public Worker(
            IJobQueueService queue,
            IServiceProvider serviceProvider,
            ILogger<Worker> logger,
            IConfiguration configuration)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _logger = logger;
            _pollingIntervalSeconds = configuration.GetValue<int>("PollingIntervalSeconds", 5);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MilkConsumptions WebJob started, listening on 'milkconsumption' queue.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var result = await _queue.ReceiveNextAsync();

                if (result != null)
                {
                    await ProcessJobAsync(result, stoppingToken);
                }
                else
                {
                    await Task.Delay(TimeSpan.FromSeconds(_pollingIntervalSeconds), stoppingToken);
                }
            }
        }

        private async Task ProcessJobAsync(QueueMessageResult result, CancellationToken stoppingToken)
        {
            var job = result.Job;

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

            try
            {
                await _queue.CompleteJobAsync(job, "Processing", null);

                var entryDate = DateTime.Parse(job.Date);

                // 1. Andha date ku already entry irukra employee IDs
                var existingEntryEmpIds = await context.MilkEntries
                    .Where(m => m.EntryDate.Date == entryDate.Date)
                    .Select(m => m.EmployeeID)
                    .ToListAsync(stoppingToken);

                // 2. Active subscriptions
                var activeSubs = await context.EmployeeSubscriptions
                    .Where(s => s.Status.ToLower() == "active")
                    .ToListAsync(stoppingToken);

                // 3. Pending subs = active subscription but no entry yet for this date
                var pendingSubs = activeSubs
                    .Where(s => !existingEntryEmpIds.Contains(s.EmployeeId))
                    .ToList();

                if (job.LocationId.HasValue)
                {
                    var empIdsInLocation = await context.Employees
                        .Where(e => e.LocationID == job.LocationId.Value)
                        .Select(e => e.ID)
                        .ToListAsync(stoppingToken);

                    pendingSubs = pendingSubs
                        .Where(s => empIdsInLocation.Contains(s.EmployeeId))
                        .ToList();
                }

                // 4. Leave check (pending / approved, date range la irundha)
                var leaveRequests = await context.LeaveRequests
                    .Where(l => l.Status.ToLower() == "pending" || l.Status.ToLower() == "approved")
                    .ToListAsync(stoppingToken);

                int createdCount = 0;

                foreach (var sub in pendingSubs)
                {
                    var empId = sub.EmployeeId;
                    var employee = await context.Employees.FindAsync(new object[] { empId }, stoppingToken);
                    if (employee == null) continue;

                    var onLeave = leaveRequests.Any(l =>
                        l.EmployeeID == empId &&
                        entryDate.Date >= l.FromDate.Date &&
                        entryDate.Date <= l.ToDate.Date);

                    var entryType = onLeave ? "Leave" : "Actual";
                    var quantity = onLeave ? 0 : sub.Quantity;

                    var newEntry = new MilkEntry
                    {
                        EmployeeID = empId,
                        LocationID = employee.LocationID,
                        EntryDate = entryDate,
                        EntryType = entryType,
                        Quantity = quantity,
                        Notes = "",
                        CreatedDate = DateTime.Now
                    };

                    context.MilkEntries.Add(newEntry);
                    createdCount++;
                }

                await context.SaveChangesAsync(stoppingToken);

                await _queue.CompleteJobAsync(job, "Completed", $"{createdCount} entries completed successfully.");
                await _queue.DeleteMessageAsync(result.MessageId, result.PopReceipt);

                _logger.LogInformation("Job {JobId} completed. {Count} entries created.", job.JobId, createdCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Job {JobId} failed.", job.JobId);
                await _queue.CompleteJobAsync(job, "Failed", ex.Message);
                await _queue.DeleteMessageAsync(result.MessageId, result.PopReceipt);
            }
        }
    }
}