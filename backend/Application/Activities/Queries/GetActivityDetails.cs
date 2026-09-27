using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

using Persistence;
using Application.Core;
using Application.Activities.DTOs;

namespace Application.Activities.Queries;

public class GetActivityDetails
{
    public class Query : IRequest<Result<ActivityDto>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<ActivityDto>>
    {
        public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(x => request.Id == x.Id, cancellationToken);

            if (activity == null) return Result<ActivityDto>.Failure("Activity not found", 404);

            return Result<ActivityDto>.Success(mapper.Map<ActivityDto>(activity));
        }
    }
}
