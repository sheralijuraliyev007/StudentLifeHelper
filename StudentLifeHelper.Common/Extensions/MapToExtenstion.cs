using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Extensions
{
    public static class MapToExtenstion
    {
        public static TEntity MapToEntity<TEntity, TModel>(this TModel model, TypeAdapterConfig? config = null)
        {
            var entity = config is null ? model.Adapt<TEntity>()
                : model.Adapt<TEntity>(config);
            return entity;
        }


        public static TEntity MapForUpdate<TEntity,TModel>(this TModel model, TEntity entity)
        {
            var entityProperties = typeof(TEntity).GetProperties();
            var modelProperties = typeof(TModel).GetProperties();

            foreach(var modelProperty in modelProperties)
            {
                var entityProperty = entityProperties.FirstOrDefault( p=> p.Name == modelProperty.Name );

                if (entityProperty is null)
                    continue;

                if (typeof(System.Collections.IEnumerable).IsAssignableFrom(entityProperty.PropertyType)
                    && entityProperty.PropertyType != typeof(string))   
                        continue;
                if (entityProperty.PropertyType.IsClass && entityProperty.PropertyType != typeof(string))
                    continue;

                var newValue = modelProperty.GetValue(model);
                var oldValue = entityProperty.GetValue(entity);

                if(newValue is not null && !Equals(newValue, oldValue))
                {
                    entityProperty.SetValue(entity, newValue);
                }

            }

            return entity;
        }


        public static TDto MapToDto<TEntity, TDto>(
            this TEntity source,
            TypeAdapterConfig? config = null)
        {
            return config == null
                ? source.Adapt<TDto>()                 // use default global config
                : source.Adapt<TDto>(config);          // use custom config
        }


    }
}
