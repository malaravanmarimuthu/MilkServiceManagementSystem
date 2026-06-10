using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;

namespace Common.Extension
{

    public static class TryCatchExtensions
    {
        //public static async ValueTask<T> TryCatchBlockAsync<T>(this ILogger logger, string methodName, string parameterlog, Func<Task<T>> actionCallback, params (Func<bool> Condition, string Message)[] validations) where T : BaseResponseDto, new()
        //{
        //    try
        //    {
        //        logger.LogInformation("{Name} - Started.", methodName);
        //        logger.LogInformation("{Name} - Input params {INI}", methodName, parameterlog);
        //        if (validations is not null && validations.Length > 0)
        //        {
        //            logger.LogInformation("{Name} -  Input request validation started.", methodName);
        //            var (_, Message) = validations.FirstOrDefault(x => x.Condition() == false);
        //            if (!string.IsNullOrEmpty(Message))
        //            {
        //                logger.LogInformation("{Name} -  Input request validation failed.", methodName);
        //                return await ValueTask.FromResult(new T() { IsSuccess = false, Message = $"Invalid request : {Message}" , StatusCode = HttpStatusCode.BadRequest });
        //            }
        //            logger.LogInformation("{Name} -  Input request validation completed.", methodName);
        //        }
        //        return await actionCallback().ConfigureAwait(false);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError("{Name} - Error occurred, Exception: {Exp}", methodName, ex.Message);
        //        return await ValueTask.FromResult(new T() { IsSuccess = false, Message = MessageString.ServerError , StatusCode = HttpStatusCode.InternalServerError });
        //    }
        //    finally
        //    {
        //        logger.LogInformation("{Name} - Completed.", methodName);
        //    }
        //}

        public static async ValueTask<IActionResult> TryCatchBlockAsync(this ILogger logger, string methodName, string parameterlog, IApiMessage<IApiResponse> _apiResponse, Func<Task<IActionResult>> actionCallback, params (Func<bool> Condition, string Message)[] validations)
        {
            try
            {
                logger.LogInformation("{Name} - Started.", methodName);
                logger.LogInformation("{Name} - Input params {INI}", methodName, parameterlog);
                if (validations is not null && validations.Length > 0)
                {
                    logger.LogInformation("{Name} -  Input request validation started.", methodName);
                    var (_, Message) = validations.FirstOrDefault(x => x.Condition() == false);
                    if (!string.IsNullOrEmpty(Message))
                    {

                        logger.LogInformation("{Name} -  Input request validation failed.", methodName);
                        return _apiResponse.BadRequest($"Invalid request : {Message}");
                    }
                    logger.LogInformation("{Name} -  Input request validation completed.", methodName);
                }
                return await actionCallback().ConfigureAwait(false);

            }catch(InvalidDataException ex)
            {
                logger.LogError("{Name} - Error occurred, Exception: {Exp}", methodName, ex.Message);
                return _apiResponse.BadRequest($"Invalid request : {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                logger.LogError("{Name} - Error occurred, Exception: {Exp}", methodName, ex.Message);
                return _apiResponse.InternalServerError($"Server Error : {ex.Message}", ex);
            }
            finally
            {
                logger.LogInformation("{Name} - Completed.", methodName);
            }
        }

        //public static async ValueTask<T> TryCatchBlockAsync<T>(this ILogger logger, Func<ValueTask<T>> actionCallback, [CallerMemberName] string methodName = "") where T : BaseResponseDto, new()
        //{
        //    try
        //    {
        //        logger.LogInformation("{Name} - Started.", methodName);
        //        return await actionCallback().ConfigureAwait(false);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError("{Name} - Error occurred, Exception: {Exp}", methodName, ex.Message);
        //        return await ValueTask.FromResult(new T() { IsSuccess = false, Message = MessageString.ServerError, StatusCode = HttpStatusCode.InternalServerError });
        //    }
        //    finally
        //    {
        //        logger.LogInformation("{Name} - Completed.", methodName);
        //    }
        //}


        //public static async ValueTask<T> TryCatchBlockV2Async<T>(this ILogger logger, Func<Task<T>> actionCallback, [CallerMemberName] string methodName = "")
        //{
        //    try
        //    {
        //        logger.LogInformation("{Name} - Started.", methodName);
        //        return await actionCallback().ConfigureAwait(false);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError("{Name} - Error occurred, Exception: {Exp}", methodName, ex.Message);
        //        return await ValueTask.FromResult(default(T));
        //    }
        //    finally
        //    {
        //        logger.LogInformation("{Name} - Completed.", methodName);
        //    }
        //}

    }

}
