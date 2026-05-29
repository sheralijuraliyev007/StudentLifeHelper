namespace StudentLifeHelper.Common.Dtos.MainPage
{
    public class RoomPostDto
    {
        public long Id { get; set; }

        public int RoomPostTypeCode { get; set; }
        public string RoomPostName { get; set; }

        public int RoomTypeCode { get; set; }
        public string RoomTypeName { get; set; }

        public string Username { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;

        public int ForGenderCode { get; set; }
        public string ForGenderName { get; set; }

        public decimal MonthlyRentFee { get; set; }

        public int CurrencyCode { get; set; }
        public string CurrencyName { get; set; }

        public decimal DepositAmount { get; set; }

        public int StatusCode { get; set; }
        public string StatusName { get; set; }

        public Guid OwnerId { get; set; }

        public int RegionCode { get; set; }
        public string RegionName { get; set; }

        public string AddressLink { get; set; } = default!;

        // 🔥 frontend-friendly shortcut
        public string? CoverImageUrl { get; set; }

        // 🔥 full gallery
        public List<RoomPostContentDto> RoomPostContents { get; set; } = new();
    }


}
