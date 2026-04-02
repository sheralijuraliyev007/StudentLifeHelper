using StudentLifeHelper.Service.Infrastructure;
using StudentLifeHelper.Service.Infrastructure.Interfaces;
using StudentLifeHelper.Service.Public.Content;
using StudentLifeHelper.Service.Public.Content.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



builder.Services.AddScoped<IMinioService, MinIOService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentService, ContentService>();



var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();



app.Run();


