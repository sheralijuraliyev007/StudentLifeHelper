using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Minio.Helper;
using StudentLifeHelper.Common.Settings.Jwt;
using StudentLifeHelper.Common.Settings.MioIO;
using StudentLifeHelper.Data.Context;
using StudentLifeHelper.Data.Repositories;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Admin;
using StudentLifeHelper.Service.Admin.Base;
using StudentLifeHelper.Service.Admin.Base.Interfaces;
using StudentLifeHelper.Service.Auth;
using StudentLifeHelper.Service.Auth.Interfaces;
using StudentLifeHelper.Service.Common;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Infrastructure;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using StudentLifeHelper.Service.Public.Content;
using StudentLifeHelper.Service.Public.Content.Interfaces;
using StudentLifeHelper.Service.Public.Manual;
using StudentLifeHelper.Service.Public.Manual.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddControllers();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Description = "JWT Bearer. : \"Authorization: Bearer { token } \"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    var jwtParam = builder.Configuration.GetSection("JwtSettings").Get<JwtSetting>();


    var key = System.Text.Encoding.UTF32.GetBytes(jwtParam.Key);
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidIssuer = jwtParam.Issuer,
        ValidateIssuer = true,
        ValidAudience = jwtParam.Audience,
        ValidateAudience = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuerSigningKey = true
    };



    options.Events = new JwtBearerEvents()
    {
        OnMessageReceived = context =>
        {
            var token = context.Token;

            if (string.IsNullOrEmpty(token))
            {
                token = context.Request.Query["token"];

                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                }
            }

            return Task.CompletedTask;
        }
    };


});







builder.Services.Configure<MinIOSettings>(
    builder.Configuration.GetSection("Minio")
    );

builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped(typeof(IBaseInfoService<>), typeof(BaseInfoService<>));
builder.Services.AddScoped<IMinioService, MinIOService>();
builder.Services.AddScoped<IContentService, ContentService>();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITranslationInfoService, TranslationInfoService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IManualService, ManualService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IUserHelper, UserHelper>();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("vue", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



var app = builder.Build();




app.UseCors("vue");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


app.Run();


