
namespace Common.Base
{
    public static class ApiResponseMessage
    {
        #region Members

        /// <summary>
        /// Media type header for Json responses
        /// </summary>
        private const string JsonMediaTypeHeader = "text/json";

        #endregion Members

        #region Public Methods

        /// <summary>
        /// Response with Status code = 200 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <returns></returns>
        public static IActionResult Ok(this IApiMessage<IApiResponse> apiMessage)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.OK);
        }

        public static IActionResult Ok<T>(this IApiMessage<IApiResponse> apiMessage, T content)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.OK
                , content: content);
        }

        /// <summary>
        /// Response with given status code and content in  API response format
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="apiMessage"></param>
        /// <param name="statusCode"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static IActionResult Content<T>(this IApiMessage<IApiResponse> apiMessage, HttpStatusCode statusCode, T value)
        {
            return GetResponseMessage(statusCode: statusCode
                , content: value);
        }

        /// <summary>
        /// Response with Status code = 200 and content in  API response format
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="apiMessage"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        public static IActionResult Json<T>(this IApiMessage<IApiResponse> apiMessage, T content)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.OK
                , content: content);
        }

        /// <summary>
        /// Response with Status code = 201 and content in  API response format
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="apiMessage"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        public static IActionResult Created<T>(this IApiMessage<IApiResponse> apiMessage, T content)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.Created
                , content: content);
        }

        /// <summary>
        /// Response with Status code = 204 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static IActionResult NoContent(this IApiMessage<IApiResponse> apiMessage
            , string message = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.NoContent
                , message: message ?? MessageString.NoContent);
        }

        /// <summary>
        /// Response with Status code = 400 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <param name="exception"></param>
        /// <returns></returns>
        public static IActionResult BadRequest(this IApiMessage<IApiResponse> apiMessage
            , string message = null, Exception exception = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.BadRequest
                , message: message ?? MessageString.BadRequest, exceptionInfo: exception);
        }

        /// <summary>
        /// Response with Status code = 401 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <param name="exception"></param>
        /// <returns></returns>
        public static IActionResult Unauthorized(this IApiMessage<IApiResponse> apiMessage
            , string message = null, Exception exception = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.Unauthorized
                , message: message ?? MessageString.UnauthorizedAccess, exceptionInfo: exception);
        }

        /// <summary>
        /// Response with Status code = 404 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static IActionResult NotFound(this IApiMessage<IApiResponse> Message
            , string message = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.NotFound
                , message: message ?? MessageString.NotFound);
        }

        /// <summary>
        /// Response with Status code = 409 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static IActionResult Conflict(this IApiMessage<IApiResponse> Message
            , string message = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.Conflict
                , message: message ?? MessageString.Conflict);
        }

        /// <summary>
        /// Response with Status code = 500 and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="message"></param>
        /// <param name="exception"></param>
        /// <returns></returns>
        public static IActionResult InternalServerError(this IApiMessage<IApiResponse> apiMessage
            , string message = null, Exception exception = null)
        {
            return GetResponseMessage(statusCode: HttpStatusCode.InternalServerError
                , message: message ?? MessageString.ServerError, exceptionInfo: exception);
        }

        /// <summary>
        /// Response with given status code and content in  API response format
        /// </summary>
        /// <param name="apiMessage"></param>
        /// <param name="statusCode"></param>
        /// <returns></returns>
        public static IActionResult StatusCode(this IApiMessage<IApiResponse> apiMessage
            , HttpStatusCode statusCode)
        {
            return GetResponseMessage(statusCode: statusCode);
        }

        #endregion

        public static IActionResult GetResponseMessage(HttpStatusCode statusCode, string message = null
          , object content = null, Exception exceptionInfo = null)
        {

            if (statusCode == HttpStatusCode.NoContent)
            {
                return new NoContentResult();
            }

            var response = new ObjectResult(string.Empty)
            {
                StatusCode = (int)statusCode
            };

            var ApiResponse = GetApiResponse(statusCode, message, content, exceptionInfo);
            if (statusCode != HttpStatusCode.NoContent)
            {
                response.Value = ApiResponse;
            }

            return response;
        }


        public static ApiResponse GetApiResponse(HttpStatusCode statusCode, string message = null
           , object content = null, Exception exceptionInfo = null)
        {
            string messageString = null;
            if (exceptionInfo != null || statusCode >= HttpStatusCode.BadRequest)
            {
                messageString = message ?? "Bad request";
            }

            
            var ApiResponse = new ApiResponse(content ?? default(object)
                , messageString);

            ApiResponse.StatusCode = statusCode;
            ApiResponse.IsSuccess = statusCode == HttpStatusCode.Accepted || statusCode == HttpStatusCode.NoContent || statusCode == HttpStatusCode.OK;

            return ApiResponse;
        }
    }
}
