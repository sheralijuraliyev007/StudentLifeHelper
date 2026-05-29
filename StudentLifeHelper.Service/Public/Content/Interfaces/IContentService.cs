namespace StudentLifeHelper.Service.Public.Content.Interfaces
{
    public interface IContentService : IStatusGeneric
    {
        Task<long?> CreateContentForImage(IFormFile? file, string folderName);

        Task<long?> UpdateContentForImage(long id,IFormFile? file);



        Task<(Stream? data, string? type, string? name)?> DownloadFile(Guid fileId);

        Task<bool> DeleteContentForImage(long id);
    }
}
