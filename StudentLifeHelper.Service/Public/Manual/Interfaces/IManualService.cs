namespace StudentLifeHelper.Service.Public.Manual.Interfaces
{
    public interface IManualService 
    {

        Task<SelectList<int>> RegionsSelect(int countryCode);

        Task<SelectList<int>> CountriesSelect();
        Task<SelectList<int>> GenderSelect();

        Task<SelectList<int>> CurrenciesSelect();

        Task<SelectList<int>> LanguagesSelect();

        Task<SelectList<int>> RoomTypesSelect();


        Task<SelectList<int>> StatesSelect();

        Task<SelectList<int>> RoomPostTypesSelect();

        Task<SelectList<int>> RolesSelect();

        Task<SelectList<int>> StatusSelect();

        Task<SelectList<int>> InfoTablesSelect();

        Task<SelectList<int>> ContentTypesSelect();

    }
}
