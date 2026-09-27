using Domain;

namespace Application;

public interface IUserAccessor
{
    string GetUserId();
    Task<User> GetUserAsync();
}
