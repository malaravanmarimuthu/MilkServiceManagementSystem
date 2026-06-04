using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Text;

namespace Common.RestClient
{
    public class RestAPIClient : IRestAPIClient
    {
        public const string EMPTY_RESPONSE = "EMPTY_RESPONSE";
        public RestAPIClient()
        {
            
        }

        /// <summary>
        /// To call the post endpoint
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="endpoint"></param>
        /// <param name="authToken"></param>
        /// <param name="payload"></param>
        /// <returns></returns>
        public async Task<T> PostAsync<T>(string endpoint, string authToken, object payload)
        {
            StringContent content = null;
            string payloadText = null;
            //_logger.LogDebug($"ApiClient.PostAsync - api-basket call started [{endpoint}]");
            if (payload != null)
            {
                payloadText = JsonConvert.SerializeObject(payload);
                content = new StringContent(payloadText, Encoding.UTF8, "application/json");
            }

            using (var apiClient = GetApiClient(authToken))
            {
                var response = await apiClient.PostAsync(endpoint, content);
                var contentText = string.Empty;
                if (response.IsSuccessStatusCode)
                {
                    contentText = await response.Content.ReadAsStringAsync();
                }
                else
                {
                    contentText = await response.Content.ReadAsStringAsync();
                    throw new ApplicationException(contentText);
                }
                var displayMessage = ExtractJsonMessage(contentText) ?? contentText;

                //_logger.LogInformation($"ApiClient.PostAsync - Retrieved from  [{endpoint}]: {displayMessage} ");
                return JsonConvert.DeserializeObject<T>(contentText);
            }
        }


        public async Task<T> PutAsync<T>(string endpoint, string authToken, object payload)
        {
            StringContent content = null;
            string payloadText = null;
            //_logger.LogDebug($"ApiClient.PutAsync - call started [{endpoint}]");
            if (payload != null)
            {
                payloadText = JsonConvert.SerializeObject(payload);
                content = new StringContent(payloadText, Encoding.UTF8, "application/json");
            }

            using (var apiClient = GetApiClient(authToken))
            {
                var response = await apiClient.PutAsync(endpoint, content);
                var contentText = string.Empty;
                if (response.IsSuccessStatusCode)
                {
                    contentText = await response.Content.ReadAsStringAsync();
                }else
                {
                    contentText = await response.Content.ReadAsStringAsync();
                    throw new ApplicationException(contentText);
                }
                
                var displayMessage = ExtractJsonMessage(contentText) ?? contentText;

                //_logger.LogInformation($"ApiClient.PutAsync - Retrieved from endpoint [{endpoint}]: {displayMessage} ");
                return JsonConvert.DeserializeObject<T>(contentText);
            }
        }

        public async Task<T> DeleteAsync<T>(string endpoint, string authToken)
        {
            //_logger.LogDebug($"ApiClient.DeleteAsync - call started [{endpoint}]");


            using (var apiClient = GetApiClient(authToken))
            {
                var response = await apiClient.DeleteAsync(endpoint);
                response.EnsureSuccessStatusCode();
                var contentText = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrEmpty(contentText) || contentText.Length == 0)
                {
                    //_logger.LogError($"ApiClient.DeleteAsync - Retrieved from endpoint [{endpoint}]");
                    throw new ApplicationException(EMPTY_RESPONSE);
                }
                var displayMessage = ExtractJsonMessage(contentText) ?? contentText;

                //_logger.LogInformation($"ApiClient.DeleteAsync - Retrieved from endpoint [{endpoint}]: {displayMessage} ");
                return JsonConvert.DeserializeObject<T>(contentText);
            }
        }

        public async Task<T> GetAsync<T>(string endpoint, string authToken)
        {
            using (var apiClient = GetApiClient(authToken))
            {
               // _logger.LogInformation($"ApiClient.GetAsync - call started [{endpoint}]");

                var response = await apiClient.GetAsync(endpoint);

                response.EnsureSuccessStatusCode();
                var contentText = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrEmpty(contentText) || contentText.Length == 0)
                {
                   // _logger.LogError($"ApiClient.GetAsync - call started [{endpoint}]");
                    throw new ApplicationException(EMPTY_RESPONSE);
                }
                var displayMessage = ExtractJsonMessage(contentText) ?? contentText;
                //_logger.LogDebug($"ApiClient.GetAsync - Retrieved from endpoint [{endpoint}]: {displayMessage} ");
                return JsonConvert.DeserializeObject<T>(contentText);
            }

        }

        private HttpClient GetApiClient(string authToken)
        {
            if (authToken == null)
            {
                throw new Exception("Auth Token is null");
            }

            var apiHttpClient = new HttpClient();
            apiHttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(@"application/json"));
            if (!string.IsNullOrWhiteSpace(authToken))
            {
                apiHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(authToken);
            }

            return apiHttpClient;
        }

        private string ExtractJsonMessage(string responseContent)
        {
            try
            {
                return JArray.Parse(responseContent).FirstOrDefault()?.ToString(Newtonsoft.Json.Formatting.Indented) ?? responseContent;
            }
            catch (System.Exception)
            {
                return null;
            }
        }
    }
}
