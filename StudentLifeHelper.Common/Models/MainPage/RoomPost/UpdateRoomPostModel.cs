using System.ComponentModel.DataAnnotations;

namespace StudentLifeHelper.Common.Models.MainPage.RoomPost
{
    public class UpdateRoomPostModel
    {

        public int? RoomPostTypeCode { get; set; }

        public int? RoomTypeCode { get; set; }

        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string? Title { get; set; } 


        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; } 

        public int? ForGenderCode { get; set; }

        public decimal? MonthlyRentFee { get; set; }

        public int? CurrencyCode { get; set; }

        public decimal? DepositAmount { get; set; }

        public int? StatusCode { get; set; }

        public int? RegionCode { get; set; }

        public string? AddressLink { get; set; }
    }
}
