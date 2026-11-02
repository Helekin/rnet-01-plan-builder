using FluentValidation;
using Application.Profiles.Commands;

namespace Application.Profiles.Validators;

public class EditProfileValidator : AbstractValidator<EditProfile.Command>
{
    public EditProfileValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty();
    }
}
