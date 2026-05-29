namespace StudentLifeHelper.Service.Admin.User.QueryObjects
{
    public static class AdminUserListSortFilter
    {
        public static IQueryable<StudentLifeHelper.Data.Entities.MainEntities.User> ApplyFilter(
   this IQueryable<StudentLifeHelper.Data.Entities.MainEntities.User> query,
   AdminUserFilterOptions options)
        {
            if (options.StateCode.HasValue)
                query = query.Where(s => s.StateCode == options.StateCode);

            if (options.RoleCode.HasValue)
                query = query.Where(s => s.RoleCode == options.RoleCode);

            if (options.ResidenceCountryCode.HasValue)
                query = query.Where(s => s.ResidenceCountryCode == options.ResidenceCountryCode);

            if (options.RegionCode.HasValue)
                query = query.Where(s => s.RegionCode == options.RegionCode);

            if (options.BirthCountryCode.HasValue)
                query = query.Where(s => s.BirthCountryCode == options.BirthCountryCode);

            if (options.GenderCode.HasValue)
                query = query.Where(s => s.GenderCode == options.GenderCode);

            if (!string.IsNullOrEmpty(options.UserName))
                query = query.Where(s => s.Username.Contains(options.UserName));

            query =  query.ApplyBaseFilter(options);

            return query;
        }
    }
}
