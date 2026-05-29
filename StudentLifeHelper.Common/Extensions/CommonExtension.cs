namespace StudentLifeHelper.Common.Extensions
{
    public static class CommonExtension
    {
        public static string GetFileUrl(this string id) => CommonConstants.FileBaseUrl + id;


        public static PaginationModel<T> ToPaginationModel<T>(this IQueryable<T> query, int page, int pageSize) where T : class
        {
            return new PaginationModel<T>
            {
                Rows = query.AsEnumerable(),
                PageIndex = page,
                PageSize = pageSize,
                Total = query.Count()
            };
        }
    }
}
