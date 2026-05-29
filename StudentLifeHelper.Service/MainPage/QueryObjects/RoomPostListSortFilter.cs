
namespace StudentLifeHelper.Service.MainPage.QueryObjects
{
    public static class RoomPostListSortFilter
    {
        public static IQueryable<RoomPost> ApplyFilter(
            this IQueryable<RoomPost> query,
            RoomPostFilterOptions options)
        {
            if (options.RoomPostTypeCode.HasValue)
                query = query.Where(r => r.RoomPostTypeCode == options.RoomPostTypeCode);

            if (options.RoomTypeCode.HasValue)
                query = query.Where(r => r.RoomTypeCode == options.RoomTypeCode);

            if (options.ForGenderCode.HasValue)
                query = query.Where(r => r.ForGenderCode == options.ForGenderCode);

            if (options.CurrencyCode.HasValue)
                query = query.Where(r => r.CurrencyCode == options.CurrencyCode);

            if (options.RegionCode.HasValue)
                query = query.Where(r => r.RegionCode == options.RegionCode);

            if (!string.IsNullOrEmpty(options.Title))
                query = query.Where(r => r.Title.Contains(options.Title));

            if (options.MinimumMonthlyRentFee.HasValue)
                query = query.Where(r => r.MonthlyRentFee >= options.MinimumMonthlyRentFee);

            if (options.MaximumMonthlyRentFee.HasValue)
                query = query.Where(r => r.MonthlyRentFee <= options.MaximumMonthlyRentFee);

            if (options.MinimumDepositAmount.HasValue)
                query = query.Where(r => r.DepositAmount >= options.MinimumDepositAmount);

            if (options.MaximumDepositAmount.HasValue)
                query = query.Where(r => r.DepositAmount <= options.MaximumDepositAmount);

            if (options.DepositExists.HasValue)
                query = options.DepositExists.Value
                    ? query.Where(r => r.DepositAmount > 0)
                    : query.Where(r => r.DepositAmount == 0 || r.DepositAmount == null);

            query = query.ApplyBaseFilter(options);
            return query;
        }

    }
}
