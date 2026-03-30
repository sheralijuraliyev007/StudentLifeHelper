using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using StatusGeneric;
using StudentLifeHelper.Common.MinIO;

using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using StudentLifeHelper.Service.Public.Content.Interfaces;


namespace StudentLifeHelper.Service.Public.Content
{
    public class ContentService(IMinioService minioService, IUnitOfWork unitOfWork) : StatusGenericHandler, IContentService
    {

        private readonly string[] _permittedExtensions = [".jpg", ".jpeg", ".png"];
        private readonly string[] _permittedMimeTypes = ["image/jpeg", "image/png"];
        public async Task<long?> CreateContentForImage(IFormFile? file, string folderName)
        {
            var(isValid, message) = ValidateFile(file);
            if(!isValid)
                throw new InvalidOperationException(message);

            var result = await ProcessFileAsync(file, folderName);

            if (result is null) return null;

            var (uploadFileModel, contentTypeId) = result.Value;

            var content = new StudentLifeHelper.Data.Entities.MainEntities.Content
            {
                Name = file!.FileName,
                FileName = uploadFileModel.FileName,
                ContentTypeId = contentTypeId,
                Folder = folderName
            };

            await unitOfWork.ContentRepository().Add(content);
            await unitOfWork.SaveChanges();
            return content.Id;




        }
        
        //public Task<(Stream? data, string? type, string? name)?> DownloadFile(Guid fileId)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<long?> UpdateContentForImage(long id, IFormFile? file)
        {
            try
            {
                var (isValid, message) = ValidateFile(file);
                if (!isValid) throw new InvalidOperationException(message);

                var content = await unitOfWork.ContentRepository().GetById(id);

                if (content == null) throw new Exception($"Image not found with the id:{id}");

                await minioService.RemoveFileAsync(content.Folder, content.FileName);

                var result = await ProcessFileAsync(file, content.Folder);
                if (result is null) return null;

                var (uploadFileModel, contentTypeId) = result.Value;
                content.Name = file!.FileName;
                content.FileName = uploadFileModel.FileName;
                content.ContentTypeId = contentTypeId;
                await unitOfWork.ContentRepository().Update(content);
                await unitOfWork.SaveChanges();
                return content.Id;
            }
            catch (Exception ex) {
                return null;
                throw new Exception(ex.Message);
            }

        }



        private Tuple<bool,string> ValidateFile(IFormFile? file)
        {
            if(file == null || file.Length == 0)
            {
                return new(false, "File is null");
            }
            const long maxFileSizeInMb = 5;

            long maxSize = maxFileSizeInMb * 1024 * 1024; // Convert MB to bytes

            if(file.Length > maxSize)
            {
                return new(false,"The max size of image should be 5MB");
            }

            if (!_permittedMimeTypes.Contains(file.ContentType.ToLower()))
                return new(false,"Only jpg and png types are allowed");


            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if(string.IsNullOrEmpty(ext) || !_permittedExtensions.Contains(ext))
            {
                return new(false, "Only jpg and png types are allowed");
            }

            return new(true,"Valid");
        }

        private async Task<(UploadFileModel uploadFileModel, int contentTypeId)?> ProcessFileAsync(IFormFile? file, string folderName, bool forImg = true)
        {
            if (forImg)
            {
                var (isValid, message) = ValidateFile(file);
                if (!isValid)
                {
                    throw new InvalidOperationException(message);
                }
            }
            var uploadModel = await GetFileDetails(file);
            await minioService.UploadFileAsync(folderName, uploadModel);
            
            CombineStatuses(minioService);

            if (HasErrors) return null;

            var contentTypeId = await (unitOfWork.ContentTypeRepository().GetAll())
                .Where(c => c.TypeName == uploadModel.ContentType)
                .Select(c => c.Id)
                .FirstAsync();

            return (uploadModel, contentTypeId);
        }

        private async Task<UploadFileModel> GetFileDetails(IFormFile? file) {
            var fileName = Guid.NewGuid();
            string contentType = file!.ContentType;
            long size = file.Length;

            var data = new MemoryStream();
            await file.CopyToAsync(data);
            data.Position = 0;

            return new UploadFileModel(fileName,contentType,size,data);
            
        } 
    }
}
