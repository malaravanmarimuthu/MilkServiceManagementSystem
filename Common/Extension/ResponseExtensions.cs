namespace Common.Extension;

public static class ResponseExtensions
{
    public static async ValueTask<TModel> ToErrorModelAsync<TModel>(this string msg) where TModel : BaseResponseDto, new()
    {
        return await ValueTask.FromResult(new TModel() { IsSuccess = false, Message = msg, StatusCode = System.Net.HttpStatusCode.NoContent });
    }

    public static async ValueTask<CollectionDto<TModel>> ToErrorCollectionAsync<TModel>(this string msg) where TModel : new()
    {
        return await ValueTask.FromResult(new CollectionDto<TModel>() { IsSuccess = false, Message = msg, StatusCode = System.Net.HttpStatusCode.NoContent });
    }

    public static async ValueTask<SingleDto<TModel>> ToErrorSingleAsync<TModel>(this string msg) where TModel : new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = false, Message = msg, StatusCode = System.Net.HttpStatusCode.NoContent });
    }

    public static async ValueTask<TModel> ToSuccessModelAsync<TModel>(this string msg) where TModel : BaseResponseDto, new()
    {
        return await ValueTask.FromResult(new TModel() { IsSuccess = true, Message = msg, StatusCode = System.Net.HttpStatusCode.OK });
    }

    public static async ValueTask<SingleDto<TModel>> ToModelAsync<TModel>(this string msg, System.Net.HttpStatusCode statusCode) where TModel : new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = true, Message = msg, StatusCode = statusCode });
    }
    public static async ValueTask<SingleDto<TModel>> ToModelAsync<TModel>(this TModel data, System.Net.HttpStatusCode statusCode) where TModel : new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = true, Data = data, StatusCode = statusCode });
    }
    

    public static async ValueTask<SingleDto<TModel>> ToModelAsync<TModel>(this TModel data) where TModel : IBaseDto, new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = true, Data = data, StatusCode = System.Net.HttpStatusCode.OK });
    }

    public static async ValueTask<SingleDto<TModel>> ToSuccessModelAsync<TModel>(this TModel data) where TModel : BaseResponseDto, new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = true, Data = data, StatusCode = System.Net.HttpStatusCode.OK });
    }

    public static async ValueTask<SingleDto<TModel>> ToUnauthorizedAsync<TModel>(this string msg) where TModel : IBaseDto, new()
    {
        return await ValueTask.FromResult(new SingleDto<TModel>() { IsSuccess = false, Message = msg, StatusCode = System.Net.HttpStatusCode.Unauthorized });
    }


    public static async ValueTask<SingleDto<TModel>> ToModelAsync<TModel>(this Task<TModel> record) where TModel : new()
    {
        TModel data = await record;
        return await ValueTask.FromResult(new SingleDto<TModel>()
        {
            IsSuccess = true,
            Data = data,
            Message = data is null ? MessageString.RecordNotFound : string.Empty,
            StatusCode = System.Net.HttpStatusCode.OK
        });
    }

    public static async ValueTask<CollectionDto<TModel>> ToModelAsync<TModel>(this Task<TModel[]> records) where TModel : new()
    {
        TModel[] data = await records;
        return await ValueTask.FromResult(new CollectionDto<TModel>()
        {
            IsSuccess = true,
            Data = data,
            Message = data.Length == 0 ? MessageString.RecordNotFound : string.Empty,
            StatusCode = System.Net.HttpStatusCode.OK
        });
    }

    public static async ValueTask<CollectionDto<TDto>> ToMapAsync<TDto>(this Task<TDto[]> data)
        where TDto : IBaseDto, new()
    {
        TDto[] values = (await data);
        return await ValueTask.FromResult(new CollectionDto<TDto>()
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            IsSuccess = true,
            Message = values.Length == 0 ? MessageString.RecordNotFound : string.Empty,
            Data = values
        });
    }

    public static async ValueTask<SingleDto<TDto>> ToMapAsync<TEntity, TDto>(this Task<TEntity> data)
        where TDto : IBaseDto, new()
        where TEntity : BaseEntityModel, new()
    {
        TDto value = (await data).ToMap<TEntity, TDto>();
        return await ValueTask.FromResult(new SingleDto<TDto>()
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            IsSuccess = true,
            Message = value is null ? MessageString.RecordNotFound : string.Empty,
            Data = value
        });
    }

    public static async ValueTask<CollectionDto<TDto>> ToMapAsync<TEntity, TDto>(this Task<TEntity[]> data)
        where TDto : IBaseDto, new()
        where TEntity : BaseEntityModel, new()
    {
        TDto[] values = (await data).ToMap<TEntity, TDto>();
        return await ValueTask.FromResult(new CollectionDto<TDto>()
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            IsSuccess = true,
            Message = values.Length == 0 ? MessageString.RecordNotFound : string.Empty,
            Data = values
        });
    }
}
