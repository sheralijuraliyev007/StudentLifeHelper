using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using StatusGeneric;
using StudentLifeHelper.Common.MinIO;
using StudentLifeHelper.Common.Settings.MioIO;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using System.Diagnostics;


namespace StudentLifeHelper.Service.Infrastructure
{
    public class MinIOService : StatusGenericHandler, IMinioService
    {
        private readonly MinioClient _minioClient;
        private readonly string _bucketName;

        public MinIOService(IOptions<MinIOSettings> options) { 
            var settings = options.Value;
            _bucketName = settings.BucketName;

            var client = new MinioClient()
                .WithEndpoint(settings.Endpoint)
                .WithCredentials(settings.AccessKey, settings.SecretKey);
            if (settings.Secure)
            {
                client = client.WithSSL();
            }
            _minioClient = (MinioClient)new MinioClient()
                .WithEndpoint(settings.Endpoint)
                .WithCredentials(settings.AccessKey, settings.SecretKey)
                .Build();
                ;
        }

        public async Task<UploadFileModel?> GetFileAsync(string folderName, Guid fileName)
        {
            try
            {
                var objectName = string.IsNullOrWhiteSpace(folderName)
                    ? fileName.ToString() : $"{folderName.TrimEnd('/')}/{fileName.ToString()}";

                var memoryStream = new MemoryStream();

                var contentType = "application/octet-stream";

                await _minioClient.GetObjectAsync(new GetObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(objectName)
                    .WithCallbackStream(stream => stream.CopyTo(memoryStream)));

                memoryStream.Position = 0;

                Message = $"File '{fileName}' retrieved successfully";
                return new UploadFileModel(fileName, contentType, memoryStream.Length, memoryStream);
            }
            catch (ObjectNotFoundException)
            {
                AddError($"File not found. FileId : {fileName}");
                return null;
            }

            catch (MinioException ex) {
                throw new MinioException($"[MinIO Error]: {ex.Message}");
            }
        }

        public async Task RemoveFileAsync(string folderName, Guid fileName)
        {
            try
            {
                var objectName = string.IsNullOrWhiteSpace(folderName)
                    ? fileName.ToString() : $"{folderName.TrimEnd('/')}/{fileName.ToString()}";

                var memoryStream = new MemoryStream();
                await _minioClient.GetObjectAsync(new GetObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(objectName)
                    .WithCallbackStream(stream =>
                    {
                        stream.CopyTo(memoryStream);
                    }));

                await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(objectName));

                Message = $"File '{fileName}' removed successfully";
            }
            catch (ObjectNotFoundException){
            }
            
            catch (Exception e) {

                throw new Exception($"[MinIO Remove Error for {fileName}]: {e.Message}");
            } 
        }

        public async Task UploadFileAsync(string folderName, UploadFileModel file)
        {
            try
            {
                bool found = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucketName));
                if (!found)
                    await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucketName));

                var objectName = string.IsNullOrWhiteSpace(folderName)
                    ? file.FileName.ToString() : $"{folderName.TrimEnd('/')}/{file.FileName.ToString()}";

                if (file.Data.CanSeek)
                {
                    file.Data.Position = 0;
                }

                await _minioClient.PutObjectAsync(new PutObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(objectName)
                    .WithStreamData(file.Data)
                    .WithObjectSize(file.Size)
                    .WithContentType(file.ContentType)
                    );
                Message = $"File '{file.FileName}' uploaded sucessfully";
            }
            catch (MinioException e)
            {
                AddError($"[MinIO Upload Error]: {e.Message}");
            }
        }

    }
}
