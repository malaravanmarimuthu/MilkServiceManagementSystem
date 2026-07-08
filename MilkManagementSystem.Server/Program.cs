using Common.Settings;
using Microsoft.Extensions.Options;
using Services;

var builder = WebApplication.CreateBuilder(args);

//// Database
//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");// "server =anaiyaantechnologies.com; port=3306; database=anaiyaante_antechCMDS; user=anaiyaante_antechCMDS; password=Anaiyaan@123; Persist Security Info=False; Connect Timeout=300";
//builder.Services.AddDbContext<AuthDbContext>(options =>
//    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
//);


ServicesDIConfig.AddDbContext(builder.Services, builder.Configuration);
// Services register
//ServicesDIConfig.AddMapster(builder.Services);
ServicesDIConfig.AddBLServices(builder.Services);
ServicesDIConfig.AddDALServices(builder.Services);

//CORS
builder.Services.AddCors(Options =>
{
    Options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "4K Fresh"
    });
});

builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthAPI:AuthSettings"));

builder.Services.AddSingleton<IAuthSettings>(sp =>
    sp.GetRequiredService<IOptions<AuthSettings>>().Value);

var app = builder.Build();

// Order matters!
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "4K Fresh");
});
//}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();