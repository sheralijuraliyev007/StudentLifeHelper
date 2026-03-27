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
    }
}
