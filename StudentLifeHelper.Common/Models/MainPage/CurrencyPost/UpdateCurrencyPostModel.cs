
using System.ComponentModel.DataAnnotations;


namespace StudentLifeHelper.Common.Models.MainPage.CurrencyPost
{
    public class UpdateCurrencyPostModel
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(4000)]
        public string? Description { get; set; }

        public int? FromCurrencyCode { get; set; }
        public int? ToCurrencyCode { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Amount { get; set; }
    }
}
