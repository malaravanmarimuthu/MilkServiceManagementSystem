using Mapster;
using Models.Dto;

namespace Services.Mappings
{
    internal class LocationMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Location, LocationDto>();
            config.NewConfig<LocationDto, Location>();
            config.NewConfig<List<Location>, List<LocationDto>>();
            config.NewConfig<List<LocationDto>, List<Location>>();
        }
    }
}