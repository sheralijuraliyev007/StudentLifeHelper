using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.FilterOptions
{
    public class CurrencyPostFilterOptions : BaseFilterOptions
    {
        public int? FromCurrencyCode { get; set; }
        public int? ToCurrencyCode { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string? Username { get; set; }
    }
}
