using StudentLifeHelper.Common.Models.Manual;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
