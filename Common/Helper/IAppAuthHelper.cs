namespace Common.Helper
{
    public interface IAppAuthHelper
    {
        public string GetCurrentAppUserId();
        public bool IsAuthenticated();
        string GetAuthToken();
        string GetClient();
        string GetTokenType();
    }
}
