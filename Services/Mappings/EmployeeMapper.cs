using Mapster;
using Models.Dto;

namespace Services.Mappings
{
    internal class EmployeeMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RegisterDto, EmployeeDto>()
    .Map(dest => dest.FirstName, src => src.FirstName)
    .Map(dest => dest.LastName, src => src.LastName)
    .Map(dest => dest.Mobile, src => src.Mobile)
    .Map(dest => dest.EmailId, src => src.EmailId)
    .Ignore(dest => dest.ID);

            config.NewConfig<Employee, EmployeeDto>();
            config.NewConfig<EmployeeDto, Employee>();
            config.NewConfig<List<Employee>, List<EmployeeDto>>();
            config.NewConfig<List<EmployeeDto>, List<Employee>>();

        }
    }
}