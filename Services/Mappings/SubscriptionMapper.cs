using Mapster;
using Models.Dto;

namespace Services.Mappings
{
    public class SubscriptionMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Subscription, SubscriptionDto>();
            config.NewConfig<SubscriptionDto, Subscription>();
            config.NewConfig<List<Subscription>, List<SubscriptionDto>>();
            config.NewConfig<List<SubscriptionDto>, List<Subscription>>();
        }
    }
}