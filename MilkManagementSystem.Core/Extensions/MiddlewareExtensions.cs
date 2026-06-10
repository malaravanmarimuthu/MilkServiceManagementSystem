using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http;
using Common.Constants;
using Common.Base;
using Common.Extension;

namespace api_authenticationservice.Extensions;

public static class MiddlewareExtensions
{
    static void TryCatchBlock(Action action)
    {
        try
        {
            action();
        }
        catch
        {
            Console.WriteLine("Exception Occcurred - ServiceExtensions");
        }
        finally { }
    }

    /// <summary>
    /// To Configure Swagger
    /// </summary>
    /// <param name="app"></param>
    /// <param name="configuration"></param>
    internal static void UseExtSwaggerUI(this IApplicationBuilder app, IConfiguration configuration)
    {
        TryCatchBlock(() =>
        {

            Console.WriteLine("Middleware Configuration - Configuring Swagger Middleware.");
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                var style = @".auth-container input{width:100%!important;}.swagger-ui .topbar{background-color:#193972}.swagger-ui .info{margin:5px 0}.swagger-ui .scheme-container{padding:3px 0} table {
  border-collapse: collapse;} table, td, th {  border: 1px solid;  padding: 10px;} table {overflow-x: auto; text-align:justify}";
                var builder = new StringBuilder(c.HeadContent);
                builder.AppendLine($"<style type='text/css'>{style}</style>");
                c.HeadContent = builder.ToString();

                c.DefaultModelsExpandDepth(-1);
            });
        });
    }


    /// <summary>
    /// To configure Exception Status CodePage (404 & others)
    /// </summary>
    /// <param name="app"></param> 
    /// <param name="configuration"></param>
    internal static void UseExtExceptionHandlerAndStatusCodePages(this IApplicationBuilder app, IConfiguration configuration)
    {
        TryCatchBlock(() =>
        {
            Console.WriteLine("Middleware Configuration - Configuring Exception Middleware.");

            app.UseExceptionHandler(appError =>
            {
                appError.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                    if (contextFeature != null)
                    {
                        var logger = context.RequestServices.GetRequiredService<ILogger<IExceptionHandlerFeature>>();
                        if (logger is not null)
                        {
                            logger.LogError($"UseExceptionHandler Middleware - Exception Occurred, Route :{context.Request.Path}, Exception Message : {contextFeature.Error.Message}");
                            logger.LogError($"UseExceptionHandler Middleware - Exception Occurred, StackTrace :{contextFeature.Error.StackTrace}");
                        }
                        await ExceptionResponseAsync(context, MessageString.ServerError);
                    }
                });
            });

            Console.WriteLine("Middleware Configuration - Configuring Exception Status CodePage Middleware.");
            app.UseStatusCodePages(async (ctx) =>
            {
                await ExceptionResponseAsync(ctx.HttpContext, ctx.HttpContext.Response.StatusCode == 404 ? "Ex_404NotFound" : "MsgConstants.Ex_SomethingWentWrong");
            });

        });

        static async Task ExceptionResponseAsync(HttpContext httpContext, string msg)
        {
            var statusCode = httpContext.Response.StatusCode;
            httpContext.Response.Clear();
            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = MediaTypeNames.Application.Json;
            await httpContext.Response.WriteAsync(new CollectionDto<object>()
            {
                StatusCode = (HttpStatusCode)statusCode,
                IsSuccess = false,
                Message = msg,
            }.ToCamalCaseJson());
        }
    }

    /// <summary>
    /// To configure Invalid ModelState ResponseFactory
    /// </summary>
    /// <param name="options"></param>
    /// <param name="configuration"></param>
    internal static void ConfigureExtInvalidModelStateResponseFactory(this ApiBehaviorOptions options, IConfiguration configuration)
    {
        TryCatchBlock(() =>
        {
            Console.WriteLine("Middleware Configuration - Configuring ApiBehaviorOptions - InvalidModelStateResponseFactory");
            options.InvalidModelStateResponseFactory = context =>
            {
                try
                {
                    var modelError = context.ModelState.LastOrDefault(modelError => modelError.Value != null && modelError.Value.Errors.Count > 0);

                    var errorMsg = string.Empty;
                    if (modelError.Value != null)
                        errorMsg = modelError.Value.Errors.FirstOrDefault()?.ErrorMessage;
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<IExceptionHandlerFeature>>();
                    logger?.LogError($"InvalidModelStateResponseFactory Middleware - Exception occurred, Route :{context.HttpContext.Request.Path}, Exception Message : {errorMsg}");

                    var result = new BadRequestObjectResult(new CollectionDto<object>()
                    {
                        StatusCode = HttpStatusCode.BadRequest,
                        IsSuccess = false,
                        Message = $"{MessageString.BadRequest} : {errorMsg}",
                    });
                    result.ContentTypes.Add(MediaTypeNames.Application.Json);
                    result.ContentTypes.Add(MediaTypeNames.Application.Xml);
                    return result;
                }
                catch
                {
                    var result = new BadRequestObjectResult(new CollectionDto<object>()
                    {
                        StatusCode = HttpStatusCode.BadRequest,
                        IsSuccess = false,
                        Message = $"{MessageString.BadRequest}",
                    });
                    result.ContentTypes.Add(MediaTypeNames.Application.Json);
                    result.ContentTypes.Add(MediaTypeNames.Application.Xml);
                    return result;
                }
                finally
                {
                }
            };
        });
    }
}
