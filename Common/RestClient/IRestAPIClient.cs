namespace Common.RestClient
{
    public interface IRestAPIClient
    {
        Task<T> PostAsync<T>(string endpoint, string authToken, object payload);
        Task<T> PutAsync<T>(string endpoint, string authToken, object payload);
        Task<T> DeleteAsync<T>(string endpoint, string authToken);
        Task<T> GetAsync<T>(string enpoint, string authToken);
    }
}
