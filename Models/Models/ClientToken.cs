using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class ClientToken
    {
        public virtual string Client { get; set; }
        public virtual string Type { get; set; }
    }

    public class UserToken: ClientToken
    {
        public virtual string UserId { get; set; }
        public virtual string OrgId { get; set; }
        public virtual string RoleId { get; set; }
        public virtual string RgCode { get; set; }
        public virtual string UserName { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string IsPostPaid { get; set; }
    }

}
