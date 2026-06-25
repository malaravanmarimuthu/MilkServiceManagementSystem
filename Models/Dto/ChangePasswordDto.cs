using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Dto
{
    public class ChangePasswordDto
    {
        public long EmployeeId { get; set; }

        public string Mobile { get; set; }

        public string OldPassword { get; set; }

        public string NewPassword { get; set; }
    }
}
