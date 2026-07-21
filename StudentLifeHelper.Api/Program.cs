
using StudentLifeHelper.Api.Hubs;
using StudentLifeHelper.Common.Dtos.SqlLog;
using StudentLifeHelper.Data.Interceptors;
using StudentLifeHelper.Service.Chat;
using StudentLifeHelper.Service.Chat.Interfaces;
using StudentLifeHelper.Service.MainPage.Base.Interface;

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
                // SignalR sends token as "access_token" in query string
                token = context.Request.Query["access_token"];

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
builder.Services.AddScoped<RoomPostService>();
builder.Services.AddScoped<IRoomPostService,RoomPostService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITranslationInfoService, TranslationInfoService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IManualService, ManualService>();
builder.Services.AddScoped<CurrencyPostService>();
builder.Services.AddScoped<ICurrencyPostService,CurrencyPostService>();
builder.Services.AddSignalR();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IUserChatService, UserChatService>();
builder.Services.AddScoped<IChatNotificationService, ChatNotificationService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IUserHelper, UserHelper>();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);
builder.Services.AddScoped<SqlQueryStore>();
builder.Services.AddScoped<SqlQueryInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(sp.GetRequiredService<SqlQueryInterceptor>());
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("vue", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:4200",
                "https://studentlifehelper.com",
                "https://www.studentlifehelper.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
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

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");


app.Run();


