using AutoMapper;

using Domain;
using Application.Activities.Commands;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Activity, Activity>();
        CreateMap<CreateActivity, Activity>();
        CreateMap<EditActivity, Activity>();
    }
}
