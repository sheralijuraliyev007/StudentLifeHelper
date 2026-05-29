namespace StudentLifeHelper.Service.Public.Content
{
    public class ContentService(IMinioService minioService, IUnitOfWork unitOfWork) : StatusGenericHandler, IContentService
    {

        private readonly string[] _permittedExtensions = [".jpg", ".jpeg", ".png"];
        private readonly string[] _permittedMimeTypes = ["image/jpeg", "image/png"];
        public async Task<long?> CreateContentForImage(IFormFile? file, string folderName)
        {
            bool isValid= ValidateFile(file);
            if (!isValid)
                return null;


            var result = await ProcessFileAsync(file, folderName);
            if (result is null) return null;

            var (uploadFileModel, contentTypeCode) = result.Value;

            try
            {
                var content = new Data.Entities.MainEntities.Content
                {
                    Name = $"{uploadFileModel.FileName}{Path.GetExtension(file.FileName)}",
                    FileId = uploadFileModel.FileName,

                    ContentTypeCode = contentTypeCode,
                    Folder = folderName,
                    StateCode = StateConstants.Active,
                    CreatedUserId = Guid.Parse("00000000-0000-0000-0000-000000000001")
                };

                await unitOfWork.ContentRepository().Add(content);
                await unitOfWork.SaveChanges();
                return content.Id;
            }
            catch (Exception ex)
            {
                AddError(ex.ToString());
                throw;
            }



        }

        //public Task<(Stream? data, string? type, string? name)?> DownloadFile(Guid fileId)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<long?> UpdateContentForImage(long id, IFormFile? file)
        {
            try
            {
                bool isValid = ValidateFile(file);

                if (!isValid)
                    return null;

                var content = await unitOfWork.ContentRepository().GetById(id);

                

                if (content == null)
                {
                    AddError($"Image not found with id: {id}");
                    return null;
                }

                var oldFileId = content.FileId;

                var result = await ProcessFileAsync(file, content.Folder);

                if (result is null)
                    return null;

                var (uploadFileModel, contentTypeCode) = result.Value;

                content.Name = file!.FileName;
                content.FileId = uploadFileModel.FileName;
                content.ContentTypeCode = contentTypeCode;

                await unitOfWork.ContentRepository().Update(content);
                await unitOfWork.SaveChanges();

                await minioService.RemoveFileAsync(content.Folder, oldFileId);

                return content.Id;
            }
            catch (Exception ex)
            {
                AddError(ex.Message);
                return null;
            }
        }



        private bool ValidateFile(IFormFile? file)
        {
            if(file == null || file.Length == 0)
            {
                AddError("File is null");
                return false;
            }
            const long maxFileSizeInMb = 5;

            long maxSize = maxFileSizeInMb * 1024 * 1024; // Convert MB to bytes

            if(file.Length > maxSize)
            {
                AddError("The max size of image should be 5MB");
                return false;
            }

            if (!_permittedMimeTypes.Contains(file.ContentType.ToLower()))
            {
                AddError("Only jpg and png types are allowed");
                return false;
            }
                


            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if(string.IsNullOrEmpty(ext) || !_permittedExtensions.Contains(ext))
            {
                AddError("Only jpg and png types are allowed");
                return false;
            }

            return true;
        }

        private async Task<(UploadFileModel uploadFileModel, int contentTypeId)?> ProcessFileAsync(IFormFile? file, string folderName, bool forImg = true)
        {
            if (forImg)
            {
                bool isValid = ValidateFile(file);
                if (!isValid)
                    return null;
                
            }
            var uploadModel = await GetFileDetails(file);
            await minioService.UploadFileAsync(folderName, uploadModel);
            
            CombineStatuses(minioService);

            if (HasErrors) return null;

            var contentTypeCode = await (unitOfWork.ContentTypeRepository().GetAll())
                .Where(c => c.TypeName == uploadModel.ContentType)
                .Select(c => c.Code)
                .FirstOrDefaultAsync();

            if (contentTypeCode == 0)
            {
                AddError($"Content type not found: {uploadModel.ContentType}");
                return null;
            }
            return new(uploadModel, contentTypeCode);
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

        public async Task<(Stream? data, string? type, string? name)?> DownloadFile(Guid fileId)
        {
            var (isExist, content) = await GetContent(fileId);
            if (!isExist)
                return new(null, null, null);

            var model = await minioService.GetFileAsync(content!.Folder, content.FileId);
            CombineStatuses(minioService);

            if (HasErrors) return null;

            model!.Data.Position = 0;

            // Use content type from MinIO metadata, not TypeName from DB
            return new(model.Data, model.ContentType, content.Name);
        }

        private async Task<Tuple<bool,StudentLifeHelper.Data.Entities.MainEntities.Content?>> GetContent(Guid fileId)
        {
            var content = await (unitOfWork.ContentRepository().GetAll(c => c.ContentType!))
                .Where(c => c.FileId == fileId).FirstOrDefaultAsync();

            if(content == null)
            {
                AddError("File not found");
                return new(false, null);
            }

            return new(true, content);

        }

        public async Task<bool> DeleteContentForImage(long id)
        {
            try
            {
                var content = await unitOfWork.ContentRepository().GetById(id);

                if (content == null)
                {
                    AddError($"Image not found with id :{id}");
                    return false;
                }

                await minioService.RemoveFileAsync(content.Folder, content.FileId);
                CombineStatuses(minioService);

                if (HasErrors) return false;

                await unitOfWork.ContentRepository().Delete(content);
                await unitOfWork.SaveChanges();

                return true;
            }
            catch (Exception ex) { 
                AddError(ex.Message);
                return false;
            }
        }
    }
}
