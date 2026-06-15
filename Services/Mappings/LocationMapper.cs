using Mapster;
using Microsoft.AspNetCore.Routing.Constraints;
using Models.Dto;

namespace Services.Mappings
{
    public class LocationMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Location, LocationDto>()
                .Map(dest => dest.LocationId,Src => Src.LocationID);
            config.NewConfig<LocationDto, Location>()
                .Map(dest => dest.LocationID, Src => Src.LocationId); ;
           // config.NewConfig<List<Location>, List<LocationDto>>();
           // config.NewConfig<List<LocationDto>, List<Location>>();
        }
    }
}