using Npgsql.Replication.PgOutput.Messages;
using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Models.Manual;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Public.Manual.Extensions;
using StudentLifeHelper.Service.Public.Manual.Interfaces;
using System.Collections.Generic;

namespace StudentLifeHelper.Service.Public.Manual
{
    public class ManualService(IUnitOfWork unitOfWork, IUserHelper userHelper) : StatusGenericHandler,IManualService
    {

        

        public async Task<SelectList<int>> GenderSelect()
        {

            var languageCode = await userHelper.GetUserLanguageCode();
            var genders = unitOfWork.GenderRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(genders, translations, InfoTableConstants.GenderTabldeCode, languageCode);

            return await Task.FromResult(list);
        }

        public async Task<SelectList<int>> RegionsSelect(int countryCode)
        {
            var languageCode = await userHelper.GetUserLanguageCode();
            var regions = unitOfWork.RegionRepository().GetAll().Where(r => r.CountryCode == countryCode && r.StateCode == StateConstants.Active);
            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(regions, translations, InfoTableConstants.RegionTabldeCode, languageCode);


            return await Task.FromResult(list);

        }

        public async Task<SelectList<int>> CountriesSelect()
        {
            

            var languageCode = await userHelper.GetUserLanguageCode();
            var countries = unitOfWork.CountryRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(countries, translations, InfoTableConstants.CountryTabldeCode, languageCode);


            return await Task.FromResult(list);


        }

        public async Task<SelectList<int>> CurrenciesSelect()
        {
            var currencies = unitOfWork.CurrencyTypeRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(currencies, translations, InfoTableConstants.CurrencyTypeTabldeCode, languageCode);


            return await Task.FromResult(list);

        }

        public async Task<SelectList<int>> LanguagesSelect()
        {

            var languages = unitOfWork.LanguageRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(languages, translations, InfoTableConstants.LanguageTableCode, languageCode);


            return await Task.FromResult(list);

        }

        public async Task<SelectList<int>> RoomTypesSelect()
        {
            var roomTypes = unitOfWork.RoomTypeRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(roomTypes, translations, InfoTableConstants.RoomTypeTabldeCode, languageCode);


            return await Task.FromResult(list);
        }

        public async Task<SelectList<int>> RolesSelect()
        {
            var roles = unitOfWork.RoleRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(roles, translations, InfoTableConstants.RoleTabldeCode, languageCode);


            return await Task.FromResult(list);
        }

        public async Task<SelectList<int>> StatusSelect()
        {
            var statuses = unitOfWork.StatusRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(statuses, translations, InfoTableConstants.StatusTableCode, languageCode);


            return await Task.FromResult(list);
        }

        public async Task<SelectList<int>> StatesSelect()
        {
            var states = unitOfWork.StateRepository().GetAll();


            var list = states.AsSelectList();

            return await Task.FromResult(list);
        }

        public async Task<SelectList<int>> InfoTablesSelect()
        {

            var infoTables = unitOfWork.InfoTableRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);
            
            var list = infoTables.AssSelectList();

            return list;

        }

        public async Task<SelectList<int>> ContentTypesSelect()
        {
            
            var contentTypes = unitOfWork.ContentTypeRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();
            
            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(contentTypes, translations, InfoTableConstants.ContentTypeTabldeCode, languageCode);


            return list;

        }

        public async Task<SelectList<int>> RoomPostTypesSelect()
        {

            var roomPostTypes = unitOfWork.RoomPostTypeRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var languageCode = await userHelper.GetUserLanguageCode();

            var translations = unitOfWork.TranslationRepository().GetAll();

            var list = BuildTranslatedSelectList(roomPostTypes, translations, InfoTableConstants.RoomPostTypeTabldeCode, languageCode);


            return list;

        }



        private SelectList<int> BuildTranslatedSelectList<TEntity>(
            IQueryable<TEntity> source,
            IQueryable<Translation> translations,
            int tableCode,
            int languageCode,
            string columnName = "full_name"
            ) where TEntity : BaseInfoEntity
        {
            var query = from e in source
                        join t in translations
                        on e.Code equals t.RecordCode
                        into tr
                        from t in tr
                        .Where(x => x.TableCode == tableCode
                        && x.ColumnName == columnName && x.LanguageCode == languageCode
                        && x.StateCode == StateConstants.Active
                        ).DefaultIfEmpty()

                        where e.StateCode == StateConstants.Active
                        select new SelectListItem<int>
                        {
                            Value = e.Id,
                            OrderCode = e.Code,
                            Text = t != null ? t.TranslatedText : e.FullName
                        };

            return new SelectList<int>(query);

        }

    }
}
