using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Settings
{
    public class AuthSettings:IAuthSettings
    {
        public string Secret { get; set; }
        public ClientSecrets[] ClientSecrets { get; set; }
        public string RefreshTokenTTL { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public string TokenExpiryinMins { get; set; }

        public string RefreshTokenExpiryinMins { get; set; }
    }
}
