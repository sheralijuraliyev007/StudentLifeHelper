using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Context;
using StudentLifeHelper.Data.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Repositories
{
    public class BaseRepository<T>(AppDbContext context)
        : IBaseRepository<T> where T : class
    {
        public async Task Add(T entity)
        {
            var createdDateProperty = typeof(T).GetProperty("CreatedDateTime");

            if (createdDateProperty != null && createdDateProperty.PropertyType == typeof(DateTime) && createdDateProperty.CanWrite)
            {
                createdDateProperty.SetValue(entity, DateTime.UtcNow);
            }

            await context.Set<T>().AddAsync(entity);
        }

        public Task AddRangeAsync(List<T> entities)
        {
            return context.Set<T>().AddRangeAsync(entities);
        }

        public async Task Delete(T entity)
        {
            context.Set<T>().Remove(entity);
        }

        public void DeleteRange(List<T> entities)
        {
            context.Set<T>().RemoveRange(entities);
        }

        public IQueryable<T> GetAll(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = context.Set<T>();

            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return query;
        }

        public IQueryable<T> GetAllWithNestedIncludes(params string[] includesPath)
        {
            IQueryable<T> query = context.Set<T>();
            foreach(var path in includesPath)
            {
                query = query.Include(path);
            }
            return query;
        }

        public async Task<T?> GetById<TK>(TK id)
        {
            var entity = await context.Set<T>().FindAsync(id);

            return entity;
        }

        public async Task SaveChanges() => await context.SaveChangesAsync();

        public async Task Update(T entity)
        {
            var modifyDateProperty = typeof(T).GetProperty("ModifiedDateTime");

            if(modifyDateProperty != null && modifyDateProperty.PropertyType == typeof(DateTime) && modifyDateProperty.CanWrite)
            {
                modifyDateProperty.SetValue(entity, DateTime.UtcNow);
            }

            context.Set<T>().Update(entity);
        }

        public void UpdateRange(List<T> entities)
        {
            context.Set<T>().UpdateRange(entities);
        }
    }
}
