using Mapster;

namespace Services.Mappings;

public static class RegisterMapper
{
    public static void RegisterMapsterConfiguration()
    {
        TypeAdapterConfig.GlobalSettings.Apply( new EmployeeMapper());
        TypeAdapterConfig.GlobalSettings.Apply(new EmployeeSubscriptionMapper());
    }
}
