using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info.Translation;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Admin.Base.Interfaces
{
    public interface ITranslationInfoService : IBaseInfoService<Translation>
    {
        Task<List<InfoTranslationDto>> GetRecordTranslations(int tableCode, int recordCode);
        Task<string?> GetTranslation(int tableCode, int recordCode, string columnName);
    }
}

