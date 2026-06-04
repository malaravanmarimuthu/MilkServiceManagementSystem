namespace Common.Base;

public sealed class SingleDto<T> : BaseResponseDto where T : new()
{
    public T Data { get; set; }
}
