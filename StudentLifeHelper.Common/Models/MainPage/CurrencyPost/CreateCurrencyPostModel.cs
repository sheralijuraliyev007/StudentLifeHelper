
using System.ComponentModel.DataAnnotations;
namespace StudentLifeHelper.Common.Models.MainPage.CurrencyPost
{
    public class CreateCurrencyPostModel
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(4000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int FromCurrencyCode { get; set; }

        [Required]
        public int ToCurrencyCode { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
    }
}
