using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Hubs;
using TcgWorld.Api.Middleware;
using TcgWorld.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "ClientOrigin";
var clientOrigin = builder.Configuration["Client:Origin"] ?? "http://localhost:3000";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<CatalogService>();
builder.Services.AddScoped<VueRecenteService>();
builder.Services.AddScoped<PricingService>();
builder.Services.AddScoped<SeriesProgressService>();
builder.Services.AddScoped<ListingService>();
builder.Services.AddScoped<AuctionService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<CollectionService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<MessagingService>();
builder.Services.AddScoped<AnalyticsExportService>();
builder.Services.AddScoped<UploadHelper>();
builder.Services.AddScoped<TcgWorld.Api.Seed.SeedRunner>();
builder.Services.AddHttpClient();
builder.Services.AddHostedService<AuctionSchedulerService>();

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(clientOrigin)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Auth 100% cookie httpOnly (pas de header Authorization) — lit le token JWT
// depuis le cookie `Cookie:Name` via OnMessageReceived, seule adaptation au
// pipeline JwtBearer standard nécessaire pour garder le même contrat que
// l'ancien serveur Node (server/src/middleware/auth.js). SignalR négocie sa
// connexion via query string, pas header, d'où la seconde lecture ici aussi.
var cookieName = builder.Configuration["Cookie:Name"] ?? "tcgworld_token";
var jwtSecret = builder.Configuration["Jwt:Secret"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSecret)),
        NameClaimType = "sub",
        RoleClaimType = "role",
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue(cookieName, out var cookieToken))
                context.Token = cookieToken;
            else if (context.HttpContext.Request.Path.StartsWithSegments("/hubs") &&
                     context.Request.Query.TryGetValue("access_token", out var qsToken))
                context.Token = qsToken;
            return Task.CompletedTask;
        },
    };
}).AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, AnalyticsBearerAuthHandler>(
    AnalyticsBearerAuthHandler.SchemeName, null);
builder.Services.AddAuthorization();

var app = builder.Build();

// `dotnet run -- seed` : lance le seed (lookups + cartes TCGdex + produits
// scellés) puis quitte, sans démarrer le serveur HTTP.
if (args.Contains("seed"))
{
    using var scope = app.Services.CreateScope();
    var seedRunner = scope.ServiceProvider.GetRequiredService<TcgWorld.Api.Seed.SeedRunner>();
    await seedRunner.RunAsync();
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors(CorsPolicy);
app.UseStaticFiles(); // sert wwwroot/uploads sous /uploads
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Json(new { ok = true }));

app.MapControllers();
app.MapHub<MessagesHub>("/hubs/messages");
app.MapHub<AuctionsHub>("/hubs/auctions");

app.Run();
