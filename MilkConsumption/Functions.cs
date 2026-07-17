using AzureMilkConsumption.WebJob.Models;
using Dapper;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Data;

namespace AzureMilkConsumption.WebJob
{
    public class Functions
    {
        public static void ProcessQueueMessage(
            [QueueTrigger("milkconsumption")] string message,
            ILogger logger)
        {
            try
            {
                logger.LogInformation("========== START ==========");
                logger.LogInformation("Raw Queue Message:");
                logger.LogInformation(message);

                var model = JsonConvert.DeserializeObject<MilkConsumptionQueueModel>(message);

                logger.LogInformation($"LocationID : {model.LocationID}");
                logger.LogInformation($"EntryDate  : {model.EntryDate}");

                using (IDbConnection db = new MySqlConnection(DbHelper.ConnectionString))
                {
                    db.Open();

                    logger.LogInformation("Database Connected");

                    db.Execute(
                        "sp_CompleteMilkConsumption",
                        new
                        {
                            pLocationID = model.LocationID,
                            pEntryDate = model.EntryDate
                        },
                        commandType: CommandType.StoredProcedure);

                    logger.LogInformation("Stored Procedure Executed");
                }

                logger.LogInformation("========== END ==========");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "WebJob Error");
                throw;
            }
        }
    }
}