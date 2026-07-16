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
                logger.LogInformation("=====================================");
                logger.LogInformation("Queue Message Received");
                logger.LogInformation(message);

                MilkConsumptionQueueModel model =
                    JsonConvert.DeserializeObject<MilkConsumptionQueueModel>(message);

                using (IDbConnection db =
                    new MySqlConnection(DbHelper.ConnectionString))
                {
                    db.Open();

                    db.Execute(
                        "sp_CompleteMilkConsumption",
                        new
                        {
                            pLocationID = model.LocationID,
                            pEntryDate = model.EntryDate
                        },
                        commandType: CommandType.StoredProcedure);

                    db.Close();
                }

                logger.LogInformation("Stored Procedure Executed Successfully");
                logger.LogInformation("=====================================");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
            }
        }
    }
}