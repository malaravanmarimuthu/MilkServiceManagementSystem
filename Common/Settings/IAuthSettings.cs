namespace Common.Settings
{
    public interface IAuthSettings
    {
        string Secret { get; set; }
        ClientSecrets[] ClientSecrets { get; set; }
        string RefreshTokenTTL { get; set; }
        string Issuer { get; set; }
        string Audience { get; set; }
        string TokenExpiryinMins { get; set; }
        string RefreshTokenExpiryinMins { get; set; }
    }
}
