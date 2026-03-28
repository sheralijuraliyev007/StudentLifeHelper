using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Extensions;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;

namespace StudentLifeHelper.Service.Admin.Base
{
    public class BaseInfoService<TEntity>(IBaseRepository<TEntity> baseRepository) : StatusGenericHandler, IBaseInfoService<TEntity>
        where TEntity : class, IHasState
    {
        public async Task<string> Create<TModel>(TModel model)
        {
            var entity = model.MapToEntity<TEntity, TModel>();

            await baseRepository.Add(entity);

            await baseRepository.SaveChanges();

            return "Added successfully";
        }

        public async Task<string?> DeleteById<TId>(TId id)
        {
            var (check, entity) = await GetEntityIfExists(id);
            if (!check) { 
                return null;
            }
            entity!.StateId = StateIdConstants.Passive;

            await baseRepository.Update(entity);
            await baseRepository.SaveChanges();
            return "Deleted successfully";

        }

        public async Task<List<TDto>> GetAll<TDto>()
        {
            var entities = baseRepository.GetAll().Where(e => e.StateId == StateIdConstants.Active).ToList();
            return entities.MapToDtos<TEntity, TDto>();
        }


        public async Task<TDto?> GetById<TDto, TId>(TId id)
        {
            var (check, entity) = await GetEntityIfExists(id);
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
            if (entity is null || entity.StateId != StateIdConstants.Active)
                return new(false, null);

            return new(true, entity);
        }
    }
}
