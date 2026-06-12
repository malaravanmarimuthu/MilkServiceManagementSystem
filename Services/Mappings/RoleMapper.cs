using Mapster;
using Models;
using Models.Dto;

namespace Services.Mappings
{
    internal class RoleMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Role, RoleDto>();
            config.NewConfig<RoleDto, Role>();
            config.NewConfig<List<Role>, List<RoleDto>>();
            config.NewConfig<List<RoleDto>, List<Role>>();
        }
    }
}