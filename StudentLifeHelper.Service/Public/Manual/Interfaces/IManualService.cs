using StatusGeneric;
using StudentLifeHelper.Common.Models.Manual;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Public.Manual.Interfaces
{
    public interface IManualService : IStatusGeneric
    {
        Task<SelectList<int>> GenderSelect();

        Task<SelectList<int>> RegionsSelect(int countryCode);

        Task<SelectList<int>> CountriesSelect();

        Task<SelectList<int>> CurrenciesSelect();

        Task<SelectList<int>> LanguagesSelect();

        Task<SelectList<int>> RoomTypesSelect();

        Task<SelectList<int>> RolesSelect();
        
        Task<SelectList<int>> StatusSelect();

        Task<SelectList<int>> StatesSelect();

        Task<SelectList<int>> InfoTablesSelect();

        Task<SelectList<int>> ContentTypesSelect();

        Task<SelectList<int>> RoomPostTypesSelect();

    }
}
