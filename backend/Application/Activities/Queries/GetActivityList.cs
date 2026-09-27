using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

using Persistence;
using Application.Activities.DTOs;

namespace Application.Activities.Queries;

public class GetActivityList
{
    public class Query : IRequest<List<ActivityDto>> { }
    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<ActivityDto>>
    {
        public async Task<List<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Activities
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        }
    }

}
