using Microsoft.EntityFrameworkCore;
using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Extensions;
using StudentLifeHelper.Common.Models.Info.Translation;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Admin.Base.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;

namespace StudentLifeHelper.Service.Admin.Base
{
    public class TranslationInfoService : BaseInfoService<Translation>, ITranslationInfoService
    {

        public TranslationInfoService(IBaseRepository<Translation> baseRepository, IUserHelper userHelper) : base(baseRepository, userHelper) { }

        public async Task<List<InfoTranslationDto>> GetRecordTranslations(int tableCode, int recordCode)
        {
            var entities = await _baseRepository.GetAll().Where(t => t.TableCode == tableCode && t.RecordCode == recordCode && t.StateCode == StateConstants.Active).ToListAsync();

            return entities.MapToDtos<Translation, InfoTranslationDto>();
        }

        public async Task<string?> GetTranslation(int tableCode, int recordCode, string columnName)
        {

            var languageCode = await _userHelper.GetUserLanguageCode();
            var entity = await _baseRepository.GetAll().Where(t => t.TableCode == tableCode 
            && t.RecordCode == recordCode && t.ColumnName == columnName 
            && t.LanguageCode == languageCode && t.StateCode == StateConstants.Active)
                .FirstOrDefaultAsync();

            return entity?.TranslatedText;
        }
    }
}
