using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace StudentLifeHelper.Common.Models.Auth
{
    public class RegisterModel
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public DateTime? BirthDate { get; set; }

        public IFormFile? ImageFile { get; set; }

        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public int BirthCountryCode { get; set; }
        public int ResidenceCountryCode { get; set; }
        public int GenderCode { get; set; }
        public int RegionCode { get; set; }
    }
}
