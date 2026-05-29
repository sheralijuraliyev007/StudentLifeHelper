namespace StudentLifeHelper.Service.Public.Manual.Extensions
{
    public static class SelectListExtension
    {
        public static SelectList<int> AssSelectList<T>(this IQueryable<T> source)
            where T : BaseInfoEntity
        {
            return new SelectList<int>(source.Select(a => new SelectListItem<int>()
            {
                Value = a.Id,
                OrderCode = a.Code,
                Text = a.FullName
            }));
        }

        public static SelectList<int> AsSelectList(this IQueryable<State> source)
        {
            return new SelectList<int>(source.Select(a => new SelectListItem<int>()
            {
                Value = a.Id,
                OrderCode = a.Code,
                Text = a.FullName
            }));



        }
    }
}
