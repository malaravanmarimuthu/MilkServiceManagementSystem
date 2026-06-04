using Common.Base;
using Common.Constants;
using Common.Extension;
using Common.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Models.Request;
using Models.Response;
using Services.Authentication;
using Services.Contracts;
using AuthorizeAttribute = Services.Authentication.AuthorizeAttribute;

namespace api_authenticationservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController(IAuthService service,
    ILogger<AuthController> logger
        ,IAppAuthHelper helper
        ,IApiMessage<IApiResponse> apiResponse
        ,IEmployeeService empservice) : ControllerBase
    {
        private readonly string _Name = nameof(AuthController);
        private readonly ILogger<AuthController> _logger = logger;
        private readonly IAuthService _service = service;
        private readonly IEmployeeService _empservice = empservice;
        private readonly IAppAuthHelper _helper = helper;
        private readonly IApiMessage<IApiResponse> _apiResponse = apiResponse;

        [HttpPost("apptoken")]
        [AllowAnonymous]
        public async ValueTask<IActionResult> CreateAppTokenAsync(ClientTokenRequestDto request)
        {
            return await _logger.TryCatchBlockAsync($"{_Name}.CreateAppTokenAsync", $"request {request.ToJson()}", _apiResponse,
                async () =>
            {
                return _apiResponse.Ok(await _service.CreateAppTokenAsync(request));

            }, (() => request != null, MessageString.ParamMissing)
            , (() => request.ClientKey.IsNotNullOrEmpty(), MessageString.ParamMissing));
        }

        //[HttpPost("signup")]
        //[Authorize]
        //public async ValueTask<IActionResult> Signup(RegisterDto request)
        //{
        //    return await _logger.TryCatchBlockAsync($"{_Name}.Signup", $"request {request.ToJson()}", _apiResponse,
        //    async () =>
        //    {
        //        return _apiResponse.Ok(await _service.RegisterMemberAsync(request));
        //    }, ValidationSignup(request)
        //   );
        //}

      

        [HttpPost("login")]
        [Authorize]
        public async ValueTask<IActionResult> Login(LoginDto request)
        {
            return await _logger.TryCatchBlockAsync($"{_Name}.CreateAppTokenAsync", $"request {request.ToJson()}", _apiResponse,
            async () =>
            {
                return _apiResponse.Ok(await _service.CreateUserTokenAsync(request));

            }, (() => request != null, MessageString.ParamMissing)
            , (() => request.Username.IsNotNullOrEmpty(), "UserName is Mandatory")
            , (() => request.Password.IsNotNullOrEmpty(), "Password is Mandatory")
            );
        }

        [HttpPost("refresh")]
        [Authorize]
        public async ValueTask<IActionResult> Refreshtoken()
        {
            return await _logger.TryCatchBlockAsync($"{_Name}.RefreshTokenAsync", $"request ", _apiResponse,
                async () =>
            {
                return _apiResponse.Ok(await _service.RefreshTokenAsync(_helper.GetAuthToken()));
            });
        }


        //[HttpGet("allemployees")]
        //[Authorize]
        //public async ValueTask<IActionResult> GetAllEmployees()
        //{
        //    return await _logger.TryCatchBlockAsync($"{_Name}.RefreshTokenAsync", $"request ", _apiResponse,
        //        async () =>
        //        {
        //            return _apiResponse.Ok(await empservice.GetALL(null));
        //        });
        //}

        #region private methods 


        //private (Func<bool> Condition, string Message)[] ValidationSignup(RegisterDto request)
        //{
        //    return [(() => request != null, MessageString.ParamMissing)
        //    , (() => request.Password.IsNotNullOrEmpty(), "Password is Mandatory")
        //    , (() => request.UserName.IsNotNullOrEmpty(), "UserName is Mandatory")
        //    , (() => request.FirstName.IsNotNullOrEmpty(), "FirstName is Mandatory")
        //    , (() => request.PhoneNumber > 0 && request.PhoneNumber.ToString().Length == 10, "PhoneNumber is Mandatory")
        //    , (() => request.Email.IsNotNullOrEmpty(), "Email is Mandatory")
        //    , (() => request.OrgId > 0, "Organization Id is Mandatory")
        //               ];
        //}

        #endregion
    }
}
