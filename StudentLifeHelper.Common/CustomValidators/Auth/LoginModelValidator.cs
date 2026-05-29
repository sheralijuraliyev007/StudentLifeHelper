using FluentValidation;
using StudentLifeHelper.Common.Models.Auth;
public class LoginModelValidator : AbstractValidator<LoginModel>
{
    public LoginModelValidator()
    {
        RuleFor(m => m.Username)
            .NotEmpty().WithMessage("Please enter username");

        RuleFor(m => m.Password)
            .NotEmpty().WithMessage("Please enter password");
    }
}