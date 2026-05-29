namespace StudentLifeHelper.Common.FilterOptions
{
    public class AdminUserFilterOptions : BaseFilterOptions
    {
        public int? StateCode { get; set; }

        public int? RoleCode { get; set; }

        public string? UserName { get; set; } = string.Empty;

        public int? RegionCode { get; set; }

        public int? GenderCode { get; set; }

        public int? ResidenceCountryCode { get; set; }
        public int? BirthCountryCode    { get; set; }

    }
}
