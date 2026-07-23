using Azure.Storage.Blobs;
using Common.Settings;
using Microsoft.Extensions.Options;
using Services.Contracts;

namespace Services
{
    public class AzureBlobService : IAzureBlobService
    {
        private readonly BlobContainerClient _containerClient;

        public AzureBlobService(IOptions<AzureBlobSettings> options)
        {
            var settings = options.Value;
            var blobServiceClient = new BlobServiceClient(settings.ConnectionString);
            _containerClient = blobServiceClient.GetBlobContainerClient(settings.ContainerName);
            _containerClient.CreateIfNotExists();
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);

            await blobClient.UploadAsync(fileStream, new Azure.Storage.Blobs.Models.BlobHttpHeaders
            {
                ContentType = contentType
            });

            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteFileAsync(string fileUrl)
        {
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var blobClient = _containerClient.GetBlobClient(fileName);
            var result = await blobClient.DeleteIfExistsAsync();
            return result.Value;
        }
    }
}