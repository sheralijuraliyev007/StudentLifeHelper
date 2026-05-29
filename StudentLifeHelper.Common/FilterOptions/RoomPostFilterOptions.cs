namespace StudentLifeHelper.Common.FilterOptions
{
    public class RoomPostFilterOptions : BaseFilterOptions
    {
        public int? RoomPostTypeCode { get; set; }

        public int? RoomTypeCode { get; set; }

        public string? Title { get; set; } = string.Empty!;


        public int? ForGenderCode { get; set; }

        public int? CurrencyCode { get; set; }

        public decimal? MinimumMonthlyRentFee { get; set; }

        public decimal? MaximumMonthlyRentFee { get; set; }


        public decimal? MinimumDepositAmount { get; set; }

        public decimal? MaximumDepositAmount { get; set;}

        public bool? DepositExists { get; set; }

        public int? RegionCode { get; set; }


    }
}
