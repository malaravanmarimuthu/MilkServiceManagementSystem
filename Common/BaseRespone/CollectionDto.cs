namespace Common.Base;

public sealed class CollectionDto<T> : BaseResponseDto where T : new()
{
    public IEnumerable<T> Data { get; set; } = [];
}
