using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Settings
{
    public interface IClientSecretsConfig
    {
     ClientSecrets[] ClientSecrets { get; set; }
    }
    public  class ClientSecretsConfig : IClientSecretsConfig
    {
        public ClientSecrets[] ClientSecrets { get; set; }
    }

    public interface IClientSecrets
    {
      string Key { get; set; }
      string Secret { get; set; }
    }
    public class ClientSecrets : IClientSecrets
    {
        public string Key { get; set; }
        public string Secret { get; set; }
    }

   
}
