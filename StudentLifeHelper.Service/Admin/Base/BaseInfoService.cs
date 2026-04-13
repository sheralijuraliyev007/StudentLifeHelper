using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Extensions;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;

namespace StudentLifeHelper.Service.Admin.Base
{
    public class BaseInfoService<TEntity>: StatusGenericHandler, IBaseInfoService<TEntity>
        where TEntity : class, IHasState, IHasCommonAttributes
    {

        protected readonly IBaseRepository<TEntity> _baseRepository;
        protected readonly IUserHelper _userHelper;

        public BaseInfoService(IBaseRepository<TEntity> baseRepository, IUserHelper userHelper)
        {
            _baseRepository = baseRepository;
            _userHelper = userHelper;
        }

        public async Task<string> Create<TModel>(TModel model)
        {
            var entity = model.MapToEntity<TEntity, TModel>();
            entity.StateCode = StateConstants.Active;
            entity.CreatedUserId = _userHelper.GetUserId();

            await _baseRepository.Add(entity);

            await _baseRepository.SaveChanges();

            return "Added successfully";
        }

        public async Task<string?> MakePassiveById<TId>(TId id)
        {
            var (check, entity) = await GetEntityIfExists(id);
            if (!check) { 
                return null;
            }
            entity!.StateCode = StateConstants.Passive;
            entity.ModifiedUserId = _userHelper.GetUserId();

            await _baseRepository.Update(entity);
            await _baseRepository.SaveChanges();
            return "Passived successfully";

        }


        public async Task<string?> MakeActiveById<TId>(TId id)
        {
            var (check, entity) = await GetEntityIfExists(id);
            if (!check)
            {
                return null;
            }
            entity!.StateCode = StateConstants.Active;
            entity.ModifiedUserId = _userHelper.GetUserId();
            await _baseRepository.Update(entity);
            await _baseRepository.SaveChanges();
            return "Activated successfully";
        }


        public async Task<string?> DeleteById<TId>(TId id)
        {
            var (check, entity) = await GetEntityIfExists(id);
            if (!check)
            {
                return null;
            }
            await _baseRepository.Delete(entity!);
            await _baseRepository.SaveChanges();
            return "Deleted successfully";
        }

        public async Task<List<TDto>> GetAll<TDto>()
        {
            var entities = _baseRepository.GetAll().Where(e => e.StateCode == StateConstants.Active).ToList();
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
            entity!.ModifiedUserId  = _userHelper.GetUserId();
            entity.ModifiedDateTime = DateTime.UtcNow;


            await _baseRepository.Update(entity!);
            await _baseRepository.SaveChanges();
            return "Updated successfully";
        }


        protected async Task<Tuple<bool, TEntity?>> GetEntityIfExists<TId>(TId id)
        {
            var entity = await _baseRepository.GetById(id);

            
            if (entity is null /*|| entity.StateId != StateIdConstants.Active*/)
                return new(false, null);

            return new(true, entity);
        }
    }
}
