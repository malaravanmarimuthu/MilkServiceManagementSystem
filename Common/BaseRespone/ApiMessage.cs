namespace Common.Base
{
    public interface IApiMessage<T>
    {

    }

    public class ApiMessage<TResponse> : HttpResponseMessage,IApiMessage<TResponse>
    {

    }
}
