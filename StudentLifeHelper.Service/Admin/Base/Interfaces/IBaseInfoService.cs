namespace StudentLifeHelper.Service.Admin;

public interface IBaseInfoService<TEntity> : IStatusGeneric
{
    Task<List<TDto>> GetAll<TDto>();
    Task<TDto?> GetById<TDto, TId>(TId id);
    Task<string> Create<TModel>(TModel model);
    Task<string?> Update<TId,TModel>(TId id, TModel model);


    Task<string?> MakePassiveById<TId>(TId id);
    Task<string?> MakeActiveById<TId>(TId id);

    Task<string?> DeleteById<TId>(TId id);
}
