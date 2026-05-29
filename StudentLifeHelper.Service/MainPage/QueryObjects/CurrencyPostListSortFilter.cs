

namespace StudentLifeHelper.Service.MainPage.QueryObjects
{
    public static class CurrencyPostListSortFilter
    {
        public static IQueryable<CurrencyPost> ApplyFilter(
            this IQueryable<CurrencyPost> query,
            CurrencyPostFilterOptions options)
        {
            if (options.FromCurrencyCode.HasValue)
                query = query.Where(c => c.FromCurrencyCode == options.FromCurrencyCode);

            if (options.ToCurrencyCode.HasValue)
                query = query.Where(c => c.ToCurrencyCode == options.ToCurrencyCode);

            if (options.MinAmount.HasValue)
                query = query.Where(c => c.Amount >= options.MinAmount);

            if (options.MaxAmount.HasValue)
                query = query.Where(c => c.Amount <= options.MaxAmount);

            if (!string.IsNullOrEmpty(options.Username))
                query = query.Where(c => c.User!.Username.Contains(options.Username));

            if (!string.IsNullOrEmpty(options.Search))
                query = query.Where(c => c.Title.Contains(options.Search)
                                      || c.Description.Contains(options.Search));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}