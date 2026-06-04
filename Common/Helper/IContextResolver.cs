using Microsoft.AspNetCore.Http;

namespace Common.Helper
{
    public interface IContextResolver
    {
        HttpContext GetOwinEnvironment();
    }
}
