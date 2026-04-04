using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Common.Settings.MioIO;
using StudentLifeHelper.Data.Context;
using StudentLifeHelper.Data.Repositories;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Admin;
using StudentLifeHelper.Service.Admin.Base;
using StudentLifeHelper.Service.Auth;
using StudentLifeHelper.Service.Auth.Interfaces;
using StudentLifeHelper.Service.Common;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Infrastructure;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using StudentLifeHelper.Service.Public.Content;
using StudentLifeHelper.Service.Public.Content.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();




builder.Services.Configure<MinIOSettings>(
    builder.Configuration.GetSection("Minio")
    );

builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped(typeof(IBaseInfoService<>), typeof(BaseInfoService<>));
builder.Services.AddScoped<IMinioService, MinIOService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IUserHelper, UserHelper>();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});





var app = builder.Build();




// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//app.UseAuthentication();
//app.UseAuthorization();
app.MapControllers();


app.Run();


