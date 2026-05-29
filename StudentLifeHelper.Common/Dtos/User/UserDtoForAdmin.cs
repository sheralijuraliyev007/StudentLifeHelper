
namespace StudentLifeHelper.Common.Dtos.User
{
    public class UserDtoForAdmin : UserDto
    {

        public int RoleId { get; set; }

        public int StateId { get; set; }

        public int GenderId { get; set; }

        public int BirthCountryId { get; set; }

        public int ResidenceCountryId { get; set; }

        public int RegionId { get; set; }

        public long? ImgId { get; set; }

        public DateTimeOffset RefreshTokenExpireTime { get; set; }

        //public bool CanActivate { get; set; }

        //public bool CanDeactivate { get; set; }
    }
}
