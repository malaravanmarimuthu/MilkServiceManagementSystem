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

    public ProfilePhotoService(IConfiguration config)
    {
        _connectionString = config["AzureBlob:ConnectionString"]!;
        _containerName = config["AzureBlob:ContainerName"]!;
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
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            if (!allowed.Contains(ext))
                throw new ArgumentException("Invalid file type.");

            var container = GetContainerClient();
            await container.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobName = $"employee_{employeeId}{ext}";
            var blob = container.GetBlobClient(blobName);

            await blob.DeleteIfExistsAsync();

            using var stream = file.OpenReadStream();
            await blob.UploadAsync(stream, new BlobHttpHeaders
            {
                ContentType = file.ContentType
            });

            return blob.Uri.ToString();
        }
        catch (Exception ex)
        {
            throw new Exception($"Upload error: {ex.Message} | {ex.InnerException?.Message}");
        }
    }

    public async Task<string?> GetPhotoUrlAsync(int employeeId)
    {
        var container = GetContainerClient();
        var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        foreach (var ext in extensions)
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
        var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        foreach (var ext in extensions)
        {
            var blob = container.GetBlobClient($"employee_{employeeId}{ext}");
            await blob.DeleteIfExistsAsync();
        }
    }
}