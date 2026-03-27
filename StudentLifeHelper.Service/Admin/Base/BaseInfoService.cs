using StatusGeneric;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Admin.Base
{
    public class BaseInfoService<TEntity>(IBaseRepository<TEntity> baseRepository) : StatusGenericHandler, IBaseInfoService<TEntity>
        where TEntity : class, IHasState
    {
        public Task<string> Create<TModel>(TModel model)
        {
            var entity = model.MapToEntity
        }

        public Task<string?> DeleteById<TId>(TId id)
        {
            throw new NotImplementedException();
        }

        public Task<List<TDto>> GetAll<TDto>()
        {
            throw new NotImplementedException();
        }

        public Task<TDto?> GetById<TDto, TId>(TId id)
        {
            throw new NotImplementedException();
        }

        public Task<string?> Update<TId, TModel>(TId id, TModel model)
        {
            throw new NotImplementedException();
        }
    }
}
