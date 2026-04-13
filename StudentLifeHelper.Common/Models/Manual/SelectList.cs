using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Manual
{
    public class SelectList<TValue> : List<SelectListItem<TValue>>
    {
        public SelectList() { 
        }

        public SelectList(IEnumerable<SelectListItem<TValue>> collection)
            : base(collection)
        {}
    }
}
