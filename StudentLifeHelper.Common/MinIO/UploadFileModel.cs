using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.MinIO
{
    public record  UploadFileModel(Guid FileName,string ContentType, long Size,Stream Data);
}
