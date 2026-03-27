using StatusGeneric;
using StudentLifeHelper.Common.Constants;
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

        public async Task<TDto?> GetById<TDto, TId>(TId id)
        {
            var(check, entity) = await GetEntityIfExists(id);
            if (!check)
                return default;

            return entity!.MapToDto<TEntity, TDto>();



        }

        public async Task<string?> Update<TId, TModel>(TId id, TModel model)
        {
            var (check, entity) = await GetEntityIfExists(id);
            if (!check)
                return null;

            entity = model.MapForUpdate(entity);


            await baseRepository.Update(entity!);
            await baseRepository.SaveChanges();
            return "Updated successfully";
        }






        private async Task<Tuple<bool, TEntity?>> GetEntityIfExists<TId>(TId id)
        {
            var entity = await baseRepository.GetById(id);
            if (entity is null  || entity.StateId != StateIdConstants.Active)
                return new(false, null);
            
            return new(true, entity);
        }
}
