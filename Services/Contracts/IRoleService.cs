using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Contracts
{
    public interface IRoleService
    {
        ValueTask<List<Role>> GetAll();
        ValueTask<RoleDto?> GetById(long id);
        ValueTask<bool> Create(RoleDto dto);
        ValueTask<bool> Update(long id, RoleDto dto);
        ValueTask<bool> Delete(long id);
    }
}
