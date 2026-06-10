using Microsoft.EntityFrameworkCore;
using MediatR;

using Domain;
using Persistence;
using Microsoft.Extensions.Logging;

namespace Application.Activities.Queries;

public class GetActivityList
{
    public class Query : IRequest<List<Activity>> { }
    public class Handler(AppDbContext context) : IRequestHandler<Query, List<Activity>>
    {
        public async Task<List<Activity>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Activities.ToListAsync(cancellationToken);
        }
    }

}
