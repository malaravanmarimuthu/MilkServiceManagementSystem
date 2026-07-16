using System;
using MySql.Data.MySqlClient;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Reflection;
using Microsoft.Azure.WebJobs;

namespace MilkManagement.InvoiceWebJob
{
    public class Functions
    {
        private static string GetConnectionString()
        {
            var basePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var jsonPath = Path.Combine(basePath, "appsettings.json");

            var json = File.ReadAllText(jsonPath);
            var config = JObject.Parse(json);

            return config["ConnectionStrings"]["DefaultConnection"].ToString();
        }

        public static void GenerateInvoices([TimerTrigger("0 0 5 1 * *")] TimerInfo timer)
        {
            Console.WriteLine($"Invoice generation started at {DateTime.Now}");

            var connStr = GetConnectionString();
            var monthYear = DateTime.Today.AddMonths(-1).ToString("yyyy-MM");

            try
            {
                using (var conn = new MySqlConnection(connStr))
                {
                    conn.Open();

                    using (var cmd = new MySqlCommand("sp_GenerateMonthlyInvoices", conn))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_MonthYear", monthYear);
                        cmd.CommandTimeout = 300;

                        cmd.ExecuteNonQuery();
                    }
                }

                Console.WriteLine($"Invoice generation completed successfully for {monthYear}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Invoice generation failed: {ex.Message}");
                Console.WriteLine(ex.ToString());
            }
        }
    }
}