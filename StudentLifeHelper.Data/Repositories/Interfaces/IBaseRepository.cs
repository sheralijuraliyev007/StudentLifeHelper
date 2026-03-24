using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Text;
using System.Threading.Tasks;

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

        Task AddRangeAsync(List<T> entities);
        void UpdateRange(List<T> entities);

        void DeleteRange(List<T> entities);

        Task SaveChanges();
    }
}
