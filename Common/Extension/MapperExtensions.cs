using Mapster;

namespace Common.Extension;

public static class MapperExtensions
{
    public static TDestination ToMap<TSource, TDestination>(this TSource source, TDestination dest) where TSource : new()
    {
        return source.Adapt(dest);
    }

    public static TDestination ToMap<TSource, TDestination>(this TSource source) where TSource : new()
    {
        return TypeAdapter<TSource, TDestination>.Map(source);
    }

    public static IEnumerable<TDestination> ToMap<TSource, TDestination>(this IEnumerable<TSource> source)
    {
        return TypeAdapter<IEnumerable<TSource>, IEnumerable<TDestination>>.Map(source);
    }

    public static TDestination[] ToMap<TSource, TDestination>(this TSource[] source)
    {
        return TypeAdapter<TSource[], TDestination[]>.Map(source);
    }

}
