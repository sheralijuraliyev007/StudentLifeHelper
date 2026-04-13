using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Manual
{
    public class SelectListItem<TValue>
    {
        public TValue Value { get; set; }

        public string Text { get; set; }

        public int OrderCode { get; set; }
    }
}
