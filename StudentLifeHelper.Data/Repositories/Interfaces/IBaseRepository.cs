namespace StudentLifeHelper.Data.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        IQueryable<T> GetAll(params Expression<Func<T, object>>[] includes);

        IQueryable<T> GetAllWithNestedIncludes(
            params string[] includesPath
            );

        Task<T?> GetById<TK>(TK id);
        Task Add(T entity);

        Task Update(T entity);

        Task Delete(T entity);

        void AddRange(List<T> entities);
        void UpdateRange(List<T> entities);

        void DeleteRange(List<T> entities);

        Task SaveChanges();
    }
}
