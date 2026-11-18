using Microsoft.AspNetCore.Identity;
using Domain;

namespace Infrastructure.Email;

public class EmailSender : IEmailSender<User>
{
    public async Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
    {
        var subject = "Confirm your email address";
        var body = $@"
        <p>Hi {user.DisplayName}</p>
        <p>Please confirm your email by clicking the link below</p>
        <p><a href='{confirmationLink}'>Click here to verify email</p>
        <p>Thanks</p>
        ";

        await SendMailAsync(email, subject, body);
    }

    public Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
    {
        throw new NotImplementedException();
    }

    public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
    {
        throw new NotImplementedException();
    }

    private async Task SendMailAsync(string email, string subject, string body)
    {
        throw new NotImplementedException();
    }
}
