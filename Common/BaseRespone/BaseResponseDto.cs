using System.Net;

namespace Common.Base;

public abstract class BaseResponseDto
{
    public HttpStatusCode StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
}
