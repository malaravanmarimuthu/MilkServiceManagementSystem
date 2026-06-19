using Data.Entities;
using Mapster;
using Models.Dto;

namespace Services.Mappings
{
    internal class EmployeeSubscriptionMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<EmployeeSubscription, EmployeeSubscriptionDto>();

            config.NewConfig<EmployeeSubscriptionDto, EmployeeSubscription>();

            config.NewConfig<List<EmployeeSubscription>, List<EmployeeSubscriptionDto>>();

            config.NewConfig<List<EmployeeSubscriptionDto>, List<EmployeeSubscription>>();
        }
    }
}