using StatusGeneric;
using StudentLifeHelper.Common.Extensions;
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
        public async Task<string> Create<TModel>(TModel model)
        {
            var entity = model.MapToEntity<TEntity,TModel>();

            await baseRepository.Add(entity);

            await baseRepository.SaveChanges();

            return "Added successfully";
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

        public async Task<string?> Update<TId, TModel>(TId id, TModel model)
        {
            var (check, entity) = await GetEnt
        }






        private async Task<Tuple<bool, TEntity?>> GetEntityIfExists<TId>(TId id)
        {
            var entity = await baseRepository.GetById(id);
            if (entity is null  || entity.StateId != State)
            {
                return new Tuple<bool, TEntity?>(false, null);
            }
            return new Tuple<bool, TEntity?>(true, entity);
        }
}
