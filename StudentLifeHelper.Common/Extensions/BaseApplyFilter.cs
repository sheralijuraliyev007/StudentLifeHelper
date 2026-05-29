

namespace StudentLifeHelper.Common.Extensions
{
    public static class BaseApplyFilter
    {
        public static IQueryable<TEntity> ApplyBaseFilter<TEntity>(
            this IQueryable<TEntity> query,
            BaseFilterOptions options,
            Expression<Func<TEntity, bool>>? searchExpression = null)
        {
            // 🔎 Search
            if (options.HasSearch() && searchExpression != null)
            {
                query = query.Where(searchExpression);
            }

            // ↕️ Sort
            query = query.OrderBy(options.HasSort()
                ? $"{options.SortBy} {options.OrderType}"
                : $"Id {BaseFilterOptions.ORDER_TYPE_DESC}");

            // 📄 Pagination
            query = query
                .Skip((options.Page - 1) * options.PageSize)
                .Take(options.PageSize);

            return query;
        }
    }

    //entitylar ko'paysa shu filterdan foydalanamiz
    //public abstract class BaseFilter<TEntity>
    //{
    //    public abstract Expression<Func<TEntity, bool>>? SearchExpression(string? search);

    //    public virtual string DefaultSortBy => "Id";
    //    public virtual string DefaultOrder => BaseFilterOptions.ORDER_TYPE_DESC;

    //    public IQueryable<TEntity> Apply(IQueryable<TEntity> query, BaseFilterOptions options)
    //    {
    //        // 🔎 Search
    //        if (options.HasSearch() && SearchExpression(options.Search) is { } expr)
    //        {
    //            query = query.Where(expr);
    //        }

    //        // ↕️ Sort
    //        query = query.OrderBy(options.HasSort()
    //            ? $"{options.SortBy} {options.OrderType}"
    //            : $"{DefaultSortBy} {DefaultOrder}");

    //        // 📄 Pagination
    //        query = query
    //            .Skip((options.Page - 1) * options.PageSize)
    //            .Take(options.PageSize);

    //        return query;
    //    }
    //}
}
