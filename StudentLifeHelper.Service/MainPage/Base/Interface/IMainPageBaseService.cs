namespace StudentLifeHelper.Service.MainPage.Base.Interface{
    public interface IMainPageBaseService<in TFilterOptions, TDto, in TCreateModel, in TUpdateModel>
        : IStatusGeneric
        where TDto : class
    {
        Task<PaginationModel<TDto>> GetAllAsync(TFilterOptions filterOptions);

        Task<TDto?> GetByIdAsync(long id);

        Task<long?> AddAsync(TCreateModel createModel);

        Task<string?> UpdateAsync(TUpdateModel updateModel, long id);

        Task<string?> ActivateAsync(long id);

        Task<string?> DeactivateAsync(long id);

        Task<string?> DeleteAsync(long id);


        Task<PaginationModel<TDto>?> GetUserPosts(TFilterOptions filters);
    }
}
