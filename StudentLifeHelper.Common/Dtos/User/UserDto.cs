namespace StudentLifeHelper.Common.Dtos.User
{
    

    public class UserDto
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string Username { get; set; } = string.Empty;

        public DateTime? BirthDate { get; set; }

        public string Role { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public string BirthCountry { get; set; } = string.Empty;

        public string ResidenceCountry { get; set; } = string.Empty;

        public string Region { get; set; } = string.Empty;

        public  int LanguageCode { get; set; }

        public string Language { get; set; } = string.Empty;

        public string? ImgUrl { get; set; }
    }
}
