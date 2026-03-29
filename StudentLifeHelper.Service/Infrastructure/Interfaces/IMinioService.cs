using StatusGeneric;
using StudentLifeHelper.Common.MinIO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Infrastructure.Interfaces
{
    public interface IMinioService : IStatusGeneric
    {
        Task UploadFileAsync(string folderName, UploadFileModel file);
        Task<UploadFileModel?> GetFileAsync(string folderName, Guid fileName);

        Task RemoveFileAsync(string folderName, Guid fileName);
    }
}
