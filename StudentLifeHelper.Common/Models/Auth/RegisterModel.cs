using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Auth
{
    public class RegisterModel
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public DateTime? BirthDate { get; set; }


        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public int BirthCountryId { get; set; }
        public int ResidenceCountryId { get; set; }
        public int GenderId { get; set; }
        public int RegionId { get; set; }
    }
}
