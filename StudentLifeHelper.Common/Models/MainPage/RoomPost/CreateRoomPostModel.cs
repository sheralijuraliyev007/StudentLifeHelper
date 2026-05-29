using System.ComponentModel.DataAnnotations;

namespace StudentLifeHelper.Common.Models.MainPage.RoomPost
{
    public class CreateRoomPostModel
    {

        [Required(ErrorMessage = "Room post type is required.")]
        public int RoomPostTypeCode { get; set; }


        [Required(ErrorMessage = "Room type is required.")]
        
        public int RoomTypeCode { get; set; }

       
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty!;


        [Required(ErrorMessage = "Description is required.")]
        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string Description { get; set; } = string.Empty!;


        [Required(ErrorMessage = "Room capacity count is req")]
        public int RoomCapacityCount { get; set; }

       
        public int? ForGenderCode { get; set; }

        [Required(ErrorMessage = "Monthly rent fee is required.")]
        public decimal MonthlyRentFee { get; set; }


        [Required(ErrorMessage = "Currency code is required.")]
        public int CurrencyCode { get; set; }

        public decimal? DepositAmount { get; set; }


        [Required(ErrorMessage = "Region code is required.")]

        public int RegionCode { get; set; }


        [Required(ErrorMessage = "Address link is required.")]
        public string AddressLink { get; set; } = string.Empty!;
    }
}
