using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NYSCRadioTV.Application.Abstractions;
using NYSCRadioTV.Domain.Entities;
using NYSCRadioTV.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var firebaseProjectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new InvalidOperationException("Firebase:ProjectId must be configured.");
var firebaseIssuer = $"https://securetoken.google.com/{firebaseProjectId}";
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = firebaseIssuer;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = firebaseIssuer,
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("FirebaseAdmin", policy => policy
        .RequireAuthenticatedUser()
        .RequireAssertion(context => context.User.HasClaim("admin", "true")));
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
builder.Services.AddCors(options => options.AddPolicy("WebClient", policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

var connectionString = builder.Configuration.GetConnectionString("RadioTv")
    ?? "Data Source=App_Data/radio-tv.db";
var sqliteConnection = new SqliteConnectionStringBuilder(connectionString);
if (sqliteConnection.Mode != SqliteOpenMode.Memory && sqliteConnection.DataSource != ":memory:")
{
    var databasePath = Path.IsPathRooted(sqliteConnection.DataSource)
        ? sqliteConnection.DataSource
        : Path.Combine(builder.Environment.ContentRootPath, sqliteConnection.DataSource);
    Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
    sqliteConnection.DataSource = databasePath;
}

builder.Services.AddDbContext<RadioTvDbContext>(options => options.UseSqlite(sqliteConnection.ToString()));
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    await DatabaseInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<RadioTvDbContext>());
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("WebClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
