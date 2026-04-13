using StudentLifeHelper.Common.Models.Manual;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Public.Manual.Extensions
{
    public static class GenderSelectListExtension
    {
        public static SelectList<int> AsSelectList(this IQueryable<Gender> source)
        {
            return new SelectList<int>(source.Select(a => new SelectListItem<int>
            {
                Value = a.Id,
                Text = a.FullName,
                OrderCode = a.Code,
            }));
        }
    }
}
