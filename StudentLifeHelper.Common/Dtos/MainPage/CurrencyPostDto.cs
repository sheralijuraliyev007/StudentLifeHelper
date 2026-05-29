using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.MainPage
{
    public class CurrencyPostDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int FromCurrencyCode { get; set; }
        public string FromCurrencyName { get; set; } = string.Empty;
        public string FromCurrencySymbol { get; set; } = string.Empty;
        public int ToCurrencyCode { get; set; }
        public string ToCurrencyName { get; set; } = string.Empty;
        public string ToCurrencySymbol { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedDateTime { get; set; }
    }
}
