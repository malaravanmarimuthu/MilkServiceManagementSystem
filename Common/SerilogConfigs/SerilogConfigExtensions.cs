using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace Common.Logging;

public static class SerilogConfigExtensions
{
    public static void ExtUseSerilog(this IHostBuilder builder, IConfiguration config)
    {
        var appInsightsConnectionString = config["AuthAPI:Serilog:AppInsights_Connection"];
        var loggerConfiguration = new LoggerConfiguration().ReadFrom.Configuration(config);

        var telemetryConfiguration = TelemetryConfiguration.CreateDefault();
        telemetryConfiguration.ConnectionString = appInsightsConnectionString;
        loggerConfiguration.WriteTo.ApplicationInsights(telemetryConfiguration, TelemetryConverter.Traces);

        loggerConfiguration = loggerConfiguration
           .Enrich.WithMachineName()
           .Enrich.WithProcessId()
           .Enrich.FromLogContext()
           .Enrich.WithEnvironmentName()
           .Enrich.WithProperty("ApplicationName", config["AuthAPI:Serilog:ApplicationName"]);

        if (config.GetSection("AuthAPI:Serilog:EnablFileLog").Get<bool>())
        {
            var filePath = string.Format("{0}{1}", config["AuthAPI:Serilog:OutputFilename"] ?? "logging", ".log");
            var fileSize = 1024 * 1024 * config["AuthAPI:Serilog:FileSizeLimitInMB"]?.ToFileMB();
            loggerConfiguration.WriteTo.File(filePath, rollingInterval: RollingInterval.Day, rollOnFileSizeLimit: true, fileSizeLimitBytes: fileSize);
        };

        builder.UseSerilog(loggerConfiguration.CreateLogger());
    }

    private static long ToFileMB(this string value)
    {
        return long.TryParse(value, out long result) ? result : 50;
    }

}
