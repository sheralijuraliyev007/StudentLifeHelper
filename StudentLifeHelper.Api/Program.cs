using StudentLifeHelper.Data.Repositories;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Admin;
using StudentLifeHelper.Service.Admin.Base;
using StudentLifeHelper.Service.Auth;
using StudentLifeHelper.Service.Auth.Interfaces;
using StudentLifeHelper.Service.Infrastructure;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using StudentLifeHelper.Service.Public.Content;
using StudentLifeHelper.Service.Public.Content.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



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



var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();



app.Run();


