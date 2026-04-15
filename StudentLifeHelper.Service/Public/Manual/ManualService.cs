using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Models.Manual;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Public.Manual.Extensions;
using StudentLifeHelper.Service.Public.Manual.Interfaces;

namespace StudentLifeHelper.Service.Public.Manual
{
    public class ManualService(IUserHelper userHelper, IUnitOfWork unitOfWork) : StatusGenericHandler,IManualService
    {
        public async Task<SelectList<int>> GenderSelect()
        {
            IQueryable<Gender> genders = unitOfWork.GenderRepository().GetAll().Where(g => g.StateCode == StateConstants.Active);

            var list = genders.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> RegionsSelect(int countryCode)
        {
            IQueryable<Region> regions = unitOfWork.RegionRepository().GetAll().Where(
                    r => r.CountryCode == countryCode && r.StateCode == StateConstants.Active
                );

            var list = regions.AssSelectList();

            return list;

        }

        public async Task<SelectList<int>> CountriesSelect()
        {
            IQueryable<Country> countries = unitOfWork.CountryRepository().
                GetAll().Where(c => c.StateCode == StateConstants.Active);

            var list = countries.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> CurrenciesSelect()
        {
            IQueryable<CurrencyType>  currencies = unitOfWork.CurrencyTypeRepository().
                GetAll().Where(c => c.StateCode == StateConstants.Active);

            var list = currencies.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> LanguagesSelect()
        {
            IQueryable<Language> languages = unitOfWork.LanguageRepository().
                GetAll().Where(l => l.StateCode == StateConstants.Active);

            var list = languages.AssSelectList();
            return list;
        }

        public async Task<SelectList<int>> RoomTypesSelect()
        {
            IQueryable<RoomType> roomTypes = unitOfWork.RoomTypeRepository().
                GetAll().Where(rt => rt.StateCode == StateConstants.Active);

            var list = roomTypes.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> RolesSelect()
        {
            IQueryable<Role> roles = unitOfWork.RoleRepository()
                .GetAll().Where(r => r.StateCode == StateConstants.Active);

            var list = roles.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> StatusSelect()
        {
            IQueryable<Status> statuses = unitOfWork.StatusRepository()
                .GetAll(s => s.StateCode == StateConstants.Active);

            var list = statuses.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> StatesSelect()
        {
            IQueryable<State> states = unitOfWork.StateRepository().
                GetAll();
            var list = states.AsSelectList();

            return list;
        }

        public async Task<SelectList<int>> InfoTablesSelect()
        {
            IQueryable<InfoTable> infoTables = unitOfWork.InfoTableRepository()
                .GetAll().Where(inf => inf.StateCode == StateConstants.Active);

            var list = infoTables.AssSelectList();

            return list;
        }

        public async Task<SelectList<int>> ContentTypesSelect()
        {
            IQueryable<ContentType> contentTypes = unitOfWork.ContentTypeRepository()
                .GetAll().Where(ct=> ct.StateCode == StateConstants.Active);

            var list = contentTypes.AssSelectList();

            return list;
        }

        
    }
}
