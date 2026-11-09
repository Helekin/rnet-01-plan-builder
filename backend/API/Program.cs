using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using FluentValidation;

using Domain;
using Persistence;
using API.Middleware;
using API.SignalR;
using Application.Core;
using Infrastructure.Security;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Infrastructure.Photos;
using Application.Interfaces;
using Microsoft.AspNetCore.Authentication.BearerToken;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});

var dbDirectory = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "database");

Directory.CreateDirectory(dbDirectory);

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddMediatR(x =>
{
    x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    x.AddOpenBehavior(typeof(ValidationBehavior<,>));
});
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddAutoMapper(x => x.AddMaps(typeof(MappingProfiles).Assembly));
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddTransient<ExceptionMiddleware>();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();
builder.Services.Configure<BearerTokenOptions>(IdentityConstants.BearerScheme, opt =>
opt.Events = new BearerTokenEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;

        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/comments"))
        {
            context.Token = accessToken;
        }

        return Task.CompletedTask;
    }
});
builder.Services.AddAuthorization(
    opt =>
    {
        opt.AddPolicy("IsActivityHost",
        policy =>
        {
            policy.Requirements.Add(new IsHostRequirement());
        }
        );
    }
);
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(x => x
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials()
.WithOrigins("http://localhost:5173", "https://localhost:5173"));

app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline.
app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();
app.MapHub<CommentHub>("/comments");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();

    await context.Database.MigrateAsync();

    await DbInitializer.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error ocurred during migration.");
}

app.Run();
