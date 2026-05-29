using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudentLifeHelper.Common.Models.User
{
    public record class UpdateUserModel
    {
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string? FirstName { get; set; }


        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string? LastName { get; set; }

        [MaxLength(50, ErrorMessage = "Middle name cannot exceed 50 characters.")]
        public string? MiddleName { get; set; }

        public int? BirthCountryCode { get; set; }

        public int? ResidenceCountryCode { get; set; }

        public DateTime? BirthDate { get; set; }


        public int? LanguageCode { get; set; }


        public int? GenderCode { get; set; }
    }
}
