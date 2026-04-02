using FluentValidation;
using StudentLifeHelper.Common.Models.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.CustomValidators.Auth
{
    public class RegisterModelValidator : AbstractValidator<RegisterModel>
    {
        public RegisterModelValidator()
        {
            RuleFor(m => m.FirstName)
                .NotEmpty().WithMessage("Please enter first name")
                .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

            RuleFor(m => m.LastName)
                .NotEmpty().WithMessage("Please enter last name")
                .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");

            RuleFor(m => m.MiddleName)
                .MaximumLength(50).WithMessage("Middle name must not exceed 50 characters")
                .When(m => !string.IsNullOrWhiteSpace(m.MiddleName));

            RuleFor(m => m.BirthDate)
                .NotNull().WithMessage("Please enter birth date")
                .LessThan(DateTime.Today).WithMessage("Birth date must be in the past")
                .Must(d => d <= DateTime.Today.AddYears(-13)).WithMessage("You must be at least 13 years old");

            RuleFor(m => m.Username)
                .NotEmpty().WithMessage("Please enter username")
                .Length(5, 50).WithMessage("Username must be between 5 and 50 characters")
                .Matches(@"^[a-zA-Z0-9._]+$").WithMessage("Username can only contain letters, numbers, dots, and underscores");

            RuleFor(m => m.Password)
                .NotEmpty().WithMessage("Please enter password")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
                .Matches(@"[\W_]").WithMessage("Password must contain at least one special character");

            RuleFor(m => m.BirthCountryId)
                .GreaterThan(0).WithMessage("Please select birth country");

            RuleFor(m => m.ResidenceCountryId)
                .GreaterThan(0).WithMessage("Please select residence country");

            RuleFor(m => m.GenderId)
                .GreaterThan(0).WithMessage("Please select gender");

            RuleFor(m => m.RegionId)
                .GreaterThan(0).WithMessage("Please select region");
        }
    }
}
