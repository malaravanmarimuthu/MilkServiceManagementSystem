using Microsoft.AspNetCore.Http;
using System;

namespace Common.Helper
{
    public class ContextResolver:IContextResolver
    {
        public IHttpContextAccessor httpContextResolver { get; set; }
        public ContextResolver(IHttpContextAccessor contextResolver)
        {
            httpContextResolver = contextResolver;
        }
        public HttpContext GetOwinEnvironment()
        {
            if (httpContextResolver?.HttpContext == null)
                throw new NullReferenceException("http Context is missing");


            return httpContextResolver.HttpContext;
        }
    }
}
