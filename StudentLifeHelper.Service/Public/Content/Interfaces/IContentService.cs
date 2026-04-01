using Microsoft.AspNetCore.Http;
using StatusGeneric;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Public.Content.Interfaces
{
    public interface IContentService : IStatusGeneric
    {
        Task<long?> CreateContentForImage(IFormFile? file, string folderName);

        Task<long?> UpdateContentForImage(long id,IFormFile? file);

        Task<(Stream? data, string? type, string? name)?> DownloadFile(Guid fileId);
    }
}
