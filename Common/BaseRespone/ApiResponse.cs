namespace Common.Base
{
    public interface IApiResponse
    {

    }

    public class ApiResponse : IApiResponse
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
        public bool IsSuccess { get; set; }
        public ApiResponse(object data, string message = null)
        {
            Data = data;
            //Meta = meta;
            Message = message;
        }

        public ApiResponse(HttpStatusCode statusCode,object data, string message = null)
        {
            Data = data;
            //Meta = meta;
            Message = message;

            StatusCode = statusCode;
        }
    }
}
