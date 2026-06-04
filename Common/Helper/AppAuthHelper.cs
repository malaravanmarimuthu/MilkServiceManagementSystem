using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Common.Helper
{
    public class AppAuthHelper : IAppAuthHelper
    {
        private readonly IContextResolver _owinContextResolver;
        private readonly ILogger<AppAuthHelper> _log;
        private const string AuthorizationHeader = "Authorization";

        public AppAuthHelper(IContextResolver owinContextResolver, ILogger<AppAuthHelper> log)
        {
            _owinContextResolver = owinContextResolver;
            _log = log;
        }

        public string GetCurrentAppUserId()
        {

            //var userId = _owinContextResolver.GetOwinEnvironment().Items["userId"]?.ToString();
            var claimsIdentity = (ClaimsIdentity)_owinContextResolver.GetOwinEnvironment().User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            var userId = claim.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                return userId;
            }
            
            return string.Empty;
        }

        public bool IsAuthenticated()
        {
            var claimsIdentity = (ClaimsIdentity)_owinContextResolver.GetOwinEnvironment().User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim != null)
            {
                return true;
            }

            return false;
        }

        //public IMemberInfo GetMember()
        //{

        //    var userClaims = _owinContextResolver.GetOwinEnvironment().User;

        //    if (userClaims == null)
        //        return null;

        //    var role = userClaims.FindFirst(TokenClaimName.Role);

        //    if (role == null || (role.Value != TokenClaimValue.UserRole && role.Value != TokenClaimValue.MemberRole))
        //    {
        //        _log.Verbose($"GetMember extracted a non-member principal from owin context: {userClaims.DisplayClaims()}");
        //        return null;
        //    }
        //    else
        //    {
        //        _log.Verbose($"Extracted member/user claims from owin context: {userClaims.DisplayClaims()}");

        //        var member = new MemberInfo(userClaims);

        //        return member;
        //    }
        //}

        public string GetMemberName()
        {
            var userClaims = _owinContextResolver.GetOwinEnvironment().User;

            if (userClaims == null)
                return "Unknown";

            var role = userClaims.FindFirst(ClaimTypes.Name);
            return role.Value;
        }



        public string GetAuthToken()
        {
            return Convert.ToString(_owinContextResolver.GetOwinEnvironment().Request.Headers[AuthorizationHeader]).Replace("Bearer ", "");
        }

        public string GetClient()
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken decodetoken = tokenHandler.ReadToken(GetAuthToken());
            var jwtSecurityDecodeToken = (JwtSecurityToken)decodetoken;
            return jwtSecurityDecodeToken.Claims.First(x => x.Type == "client").Value.ToLower();
            
        }

        public string GetTokenType()
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken decodetoken = tokenHandler.ReadToken(GetAuthToken());
            var jwtSecurityDecodeToken = (JwtSecurityToken)decodetoken;
            return jwtSecurityDecodeToken.Claims.First(x => x.Type == "type").Value.ToLower();

        }
    }
}
