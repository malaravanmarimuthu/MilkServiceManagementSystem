using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

public interface IProfilePhotoService
{
    Task<string> UploadAsync(int employeeId, IFormFile file);
    Task<string?> GetPhotoUrlAsync(int employeeId);
    Task DeleteAsync(int employeeId);
}

public class ProfilePhotoService : IProfilePhotoService
{
    private readonly string _connectionString;
    private readonly string _containerName;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    private readonly BlobServiceClient _blobserviceClient;
    private readonly BlobContainerClient _blobContainerClient;

    public ProfilePhotoService(IConfiguration config)
    {
        _connectionString = config["AzureBlob:ConnectionString"]
            ?? throw new InvalidOperationException("AzureBlob:ConnectionString missing in configuration.");

        _blobserviceClient = new BlobServiceClient(_connectionString);
        _containerName = config["AzureBlob:ContainerName"]
            ?? throw new InvalidOperationException("AzureBlob:ContainerName missing in configuration.");
        _blobContainerClient = _blobserviceClient.GetBlobContainerClient(_containerName);
    }

    private BlobContainerClient GetContainerClient()
    {
        return new BlobContainerClient(_connectionString, _containerName);
    }

    public async Task<string> UploadAsync(int employeeId, IFormFile file)
    {
        try
        {
            var ext = Path.GetExtension(file.FileName).ToLower();

            if (!AllowedExtensions.Contains(ext))
                throw new ArgumentException("Invalid file type. Allowed: jpg, jpeg, png, webp.");

            var container = GetContainerClient();
            await container.CreateIfNotExistsAsync(PublicAccessType.Blob);

            foreach (var oldExt in AllowedExtensions)
            {
                var oldBlob = container.GetBlobClient($"employee_{employeeId}{oldExt}");
                await oldBlob.DeleteIfExistsAsync();
            }

            var blobName = $"employee_{employeeId}{ext}";
            var blob = container.GetBlobClient(blobName);

            using var stream = file.OpenReadStream();
            await blob.UploadAsync(stream, new BlobHttpHeaders
            {
                ContentType = file.ContentType
            });

            return blob.Uri.ToString();
        }
        catch (ArgumentException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Upload error: {ex.Message} | {ex.InnerException?.Message}");
        }
    }

    public async Task<string?> GetPhotoUrlAsync(int employeeId)
    {
        var container = GetContainerClient();

        foreach (var ext in AllowedExtensions)
        {
            var blob = container.GetBlobClient($"employee_{employeeId}{ext}");
            if (await blob.ExistsAsync())
                return blob.Uri.ToString();
        }

        return null;
    }

    public async Task DeleteAsync(int employeeId)
    {
        var container = GetContainerClient();

        foreach (var ext in AllowedExtensions)
        {
            var blob = container.GetBlobClient($"employee_{employeeId}{ext}");
            await blob.DeleteIfExistsAsync();
        }
    }
}