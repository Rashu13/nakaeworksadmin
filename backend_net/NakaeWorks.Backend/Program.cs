using Microsoft.AspNetCore.Authentication.JwtBearer;
// Force rebuild
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 1. Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Authentication (JWT)
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    Console.WriteLine("WARNING: Jwt:Key is missing from configuration! Using a temporary fallback key. PLEASE SET THIS IN ENVIRONMENT VARIABLES.");
    jwtKey = "ThisIsADummyFallbackKeyForTestingPurposesOnlyReplaceItInProduction1234567890!";
}
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.MapInboundClaims = false; // .NET 8: Prevent claim type remapping (replaces DefaultInboundClaimTypeMap.Clear())
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Iterate as needed
        ValidateAudience = false,
        NameClaimType = "id", // Match 'id' claim
        RoleClaimType = "role" // Match literal 'role' claim
    };
});

// 3. Controllers and API
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddSignalR();

// Register application services
builder.Services.AddScoped<NakaeWorks.Backend.Services.BookingService>();
builder.Services.AddScoped<NakaeWorks.Backend.Services.ProviderService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<NakaeWorks.Backend.Services.SmsService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient",
        policy => policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://pathostar.in", "https://www.pathostar.in", "https://service.pathostar.in", "https://ser.pathostar.in") // Matches Node.js server.js origins
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

var app = builder.Build();

// Seeding logic for Categories
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();

        // -2. Seed Content (Banners & Collections)
        if (!context.Banners.Any())
        {
            var banners = new List<Banner>
            {
                new Banner { Title = "Summer Sale", ImageUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop", Link = "/services", Position = 1 },
                new Banner { Title = "AC Repair", ImageUrl = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop", Link = "/services/ac-service", Position = 2 }
            };
            context.Banners.AddRange(banners);
            context.SaveChanges();
        }

        if (!context.Collections.Any())
        {
            var collections = new List<Collection>
            {
                new Collection { Title = "New Arrivals", Type = "auto-new", Position = 1 },
                new Collection { Title = "Featured Services", Type = "auto-featured", Position = 2 }
            };
            context.Collections.AddRange(collections);
            context.SaveChanges();
        }

        // -1. Seed System Settings
        var defaultSettings = new List<SystemSetting>
        {
            new SystemSetting { Key = "platform_fee", Value = "49", Description = "Fixed platform fee per booking" },
            new SystemSetting { Key = "tax_percentage", Value = "18", Description = "GST percentage applicable on service + fee" },
            new SystemSetting { Key = "support_email", Value = "Jaspreetsinghkhalasa97@gmail.com", Description = "Support email address" },
            new SystemSetting { Key = "support_phone", Value = "8168142981", Description = "Support phone number" },
            new SystemSetting { Key = "work_time", Value = "9:00 AM - 9:00 PM", Description = "Official working hours" }
        };

        foreach (var ds in defaultSettings)
        {
            if (!context.SystemSettings.Any(s => s.Key == ds.Key))
            {
                ds.CreatedAt = DateTime.UtcNow;
                ds.UpdatedAt = DateTime.UtcNow;
                context.SystemSettings.Add(ds);
            }
        }
        context.SaveChanges();

        // 0. Seed Booking Statuses
        if (!context.BookingStatuses.Any())
        {
            var statuses = new List<BookingStatus>
            {
                new BookingStatus { Name = "Pending", Slug = "pending", Sequence = 1 },
                new BookingStatus { Name = "Confirmed", Slug = "confirmed", Sequence = 2 },
                new BookingStatus { Name = "In Progress", Slug = "in_progress", Sequence = 3 },
                new BookingStatus { Name = "Completed", Slug = "completed", Sequence = 4 },
                new BookingStatus { Name = "Cancelled", Slug = "cancelled", Sequence = 5 }
            };
            context.BookingStatuses.AddRange(statuses);
            context.SaveChanges();
        }

        // 1. Seed Categories if empty or low
        if (context.Categories.Count() < 5) // Seeding only if data is low
        {
            var defaultCategories = new List<Category>
            {
                new Category { Name = "AC Service", Slug = "ac-service", Icon = "ac_unit", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Cleaning", Slug = "cleaning", Icon = "cleaning_services", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Electrician", Slug = "electrician", Icon = "electrical_services", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Plumber", Slug = "plumber", Icon = "plumbing", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Carpenter", Slug = "carpenter", Icon = "handyman", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Painting", Slug = "painting", Icon = "format_paint", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Salon & Spa", Slug = "salon", Icon = "spa", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Car Care", Slug = "automotive", Icon = "directions_car", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Pest Control", Slug = "pest-control", Icon = "bug_report", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Category { Name = "Appliance Repair", Slug = "appliance-repair", Icon = "settings_input_component", Status = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };
            context.Categories.AddRange(defaultCategories);
            context.SaveChanges();
        }

        // 2. Seed Providers if low
        if (context.Users.Count(u => u.Role == "provider") < 5)
        {
            var providers = new List<User>
            {
                new User { Name = "Rahul Sharma", Email = "rahul@nakae.com", Password = "Password123!", Phone = "9876543210", Role = "provider", Status = true, Avatar = "https://randomuser.me/api/portraits/men/32.jpg", CreatedAt = DateTime.UtcNow },
                new User { Name = "Priya Singh", Email = "priya@nakae.com", Password = "Password123!", Phone = "9876543211", Role = "provider", Status = true, Avatar = "https://randomuser.me/api/portraits/women/44.jpg", CreatedAt = DateTime.UtcNow },
                new User { Name = "Amit Verma", Email = "amit@nakae.com", Password = "Password123!", Phone = "9876543212", Role = "provider", Status = true, Avatar = "https://randomuser.me/api/portraits/men/45.jpg", CreatedAt = DateTime.UtcNow },
                new User { Name = "Sneha Gupta", Email = "sneha@nakae.com", Password = "Password123!", Phone = "9876543213", Role = "provider", Status = true, Avatar = "https://randomuser.me/api/portraits/women/68.jpg", CreatedAt = DateTime.UtcNow },
                new User { Name = "Vikram Malhotra", Email = "vikram@nakae.com", Password = "Password123!", Phone = "9876543214", Role = "provider", Status = true, Avatar = "https://randomuser.me/api/portraits/men/22.jpg", CreatedAt = DateTime.UtcNow }
            };

             foreach (var p in providers)
             {
                 if (!context.Users.Any(u => u.Email == p.Email))
                 {
                     context.Users.Add(p);
                 }
             }
             context.SaveChanges();
        }

        // 3. Seed Services if empty or low populated
        var provider = context.Users.FirstOrDefault(u => u.Role == "provider");
        if (provider != null && context.Services.Count() < 30)
        {
            // Clear existing for a fresh comprehensive seed
            var existingServices = context.Services.ToList();
            context.Services.RemoveRange(existingServices);
            context.SaveChanges();

            var categories = context.Categories.ToList();
            var servicesList = new List<Service>();

            foreach (var cat in categories)
            {
                if (cat.Slug == "ac-service")
                {
                    servicesList.Add(new Service { Name = "Split AC Service", Slug = "split-ac-service", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Discount = 50, Description = "Comprehensive servicing for split ACs including filter cleaning and gas check.", Duration = 60, IsFeatured = true });
                    servicesList.Add(new Service { Name = "Window AC Service", Slug = "window-ac-service", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Discount = 40, Description = "Complete servicing for window AC units.", Duration = 60 });
                    servicesList.Add(new Service { Name = "AC Installation (Split)", Slug = "ac-install-split", CategoryId = cat.Id, ProviderId = provider.Id, Price = 1499, Description = "Professional installation of split AC units.", Duration = 120 });
                    servicesList.Add(new Service { Name = "AC Installation (Window)", Slug = "ac-install-window", CategoryId = cat.Id, ProviderId = provider.Id, Price = 699, Description = "Professional installation of window AC units.", Duration = 60 });
                    servicesList.Add(new Service { Name = "AC Gas Refill", Slug = "ac-gas-refill", CategoryId = cat.Id, ProviderId = provider.Id, Price = 2499, Discount = 100, Description = "Top-up or full refill of AC refrigerant gas.", Duration = 45 });
                    servicesList.Add(new Service { Name = "AC Uninstallation", Slug = "ac-uninstall", CategoryId = cat.Id, ProviderId = provider.Id, Price = 699, Description = "Safe checks and uninstallation of AC units.", Duration = 45 });
                    servicesList.Add(new Service { Name = "AC PCB Repair", Slug = "ac-pcb-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 1200, Description = "Repairing of AC motherboard/circuit board.", Duration = 60 });
                }
                else if (cat.Slug == "cleaning")
                {
                    servicesList.Add(new Service { Name = "Full Home Deep Cleaning (1BHK)", Slug = "full-home-1bhk", CategoryId = cat.Id, ProviderId = provider.Id, Price = 3999, Discount = 500, Description = "Deep cleaning of 1BHK apartment including floor, bathroom, and kitchen.", Duration = 240, IsFeatured = true });
                    servicesList.Add(new Service { Name = "Full Home Deep Cleaning (2BHK)", Slug = "full-home-2bhk", CategoryId = cat.Id, ProviderId = provider.Id, Price = 4999, Discount = 600, Description = "Deep cleaning of 2BHK apartment.", Duration = 300 });
                    servicesList.Add(new Service { Name = "Full Home Deep Cleaning (3BHK)", Slug = "full-home-3bhk", CategoryId = cat.Id, ProviderId = provider.Id, Price = 5999, Discount = 700, Description = "Deep cleaning of 3BHK apartment.", Duration = 360 });
                    servicesList.Add(new Service { Name = "Bathroom Cleaning", Slug = "bathroom-clean", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Discount = 50, Description = "Intensive cleaning and sanitization of one bathroom.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Kitchen Cleaning", Slug = "kitchen-clean", CategoryId = cat.Id, ProviderId = provider.Id, Price = 999, Discount = 100, Description = "Degreasing and cleaning of kitchen slabs, tiles, and cabinets.", Duration = 90 });
                    servicesList.Add(new Service { Name = "Sofa Cleaning (5 Seater)", Slug = "sofa-clean-5", CategoryId = cat.Id, ProviderId = provider.Id, Price = 699, Description = "Dry/Wet vacuuming and shampooing of sofa.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Carpet Cleaning", Slug = "carpet-clean", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "Deep cleaning of carpets to remove dust and allergens.", Duration = 45 });
                }
                else if (cat.Slug == "electrician")
                {
                    servicesList.Add(new Service { Name = "Fan Repair", Slug = "fan-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 149, Description = "Repairing ceiling or pedestal fans.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Fan Installation", Slug = "fan-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 199, Description = "Installation of new ceiling fans.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Switchboard Repair", Slug = "switchboard-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 249, Description = "Fixing loose connections or faulty switches.", Duration = 30 });
                    servicesList.Add(new Service { Name = "MCB/Fuse Replacement", Slug = "mcb-replace", CategoryId = cat.Id, ProviderId = provider.Id, Price = 299, Description = "Replacing fuse or MCB for safety.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Inverter Installation", Slug = "inverter-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 599, Description = "Installing inverter and battery setup.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Tube Light Installation", Slug = "tubelight-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 129, Description = "Fixing tube lights or fancy lights.", Duration = 30 });
                    servicesList.Add(new Service { Name = "House Wiring Check", Slug = "house-wiring", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "Checking internal wiring for faults.", Duration = 60 });
                }
                else if (cat.Slug == "plumber")
                {
                    servicesList.Add(new Service { Name = "Tap Repair", Slug = "tap-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 129, Description = "Fixing leaking taps.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Washbasin Installation", Slug = "washbasin-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 599, Description = "Installing new washbasin.", Duration = 90 });
                    servicesList.Add(new Service { Name = "Blockage Removal", Slug = "blockage-remove", CategoryId = cat.Id, ProviderId = provider.Id, Price = 349, Description = "Clearing clogged drains and pipes.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Water Tank Cleaning (500L)", Slug = "tank-clean-500", CategoryId = cat.Id, ProviderId = provider.Id, Price = 999, Discount = 100, Description = "Mechanized cleaning of overhead water tank.", Duration = 60, IsFeatured = true });
                    servicesList.Add(new Service { Name = "Toilet Seat Installation", Slug = "toilet-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 799, Description = "Installing western or indian toilet seat.", Duration = 120 });
                    servicesList.Add(new Service { Name = "Motor Installation", Slug = "motor-install", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "Installing water pump motor.", Duration = 60 });
                }
                else if (cat.Slug == "carpenter")
                {
                    servicesList.Add(new Service { Name = "Door Lock Repair", Slug = "door-lock-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 249, Description = "Repairing or replacing door locks.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Door Hinge Fix", Slug = "hinge-fix", CategoryId = cat.Id, ProviderId = provider.Id, Price = 199, Description = "Fixing squeaky or loose door hinges.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Curtain Rod Installation", Slug = "curtain-rod", CategoryId = cat.Id, ProviderId = provider.Id, Price = 149, Description = "Drilling and installing curtain rods.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Furniture Assembly", Slug = "furniture-assembly", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "General furniture assembly service.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Bed Repair", Slug = "bed-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Description = "Fixing creaking beds or broken slats.", Duration = 60 });
                }
                else if (cat.Slug == "painting")
                {
                    servicesList.Add(new Service { Name = "Single Room Painting", Slug = "room-paint", CategoryId = cat.Id, ProviderId = provider.Id, Price = 2999, Description = "Repainting of a single room (approx 12x12).", Duration = 240, IsFeatured = true });
                    servicesList.Add(new Service { Name = "Full Home Painting (2BHK)", Slug = "home-paint-2bhk", CategoryId = cat.Id, ProviderId = provider.Id, Price = 14999, Description = "Complete painting for a 2BHK apartment.", Duration = 480 }); 
                    servicesList.Add(new Service { Name = "Waterproofing", Slug = "waterproofing", CategoryId = cat.Id, ProviderId = provider.Id, Price = 1999, Description = "Spot waterproofing for damp walls.", Duration = 120 });
                }
                else if (cat.Slug == "salon")
                {
                    servicesList.Add(new Service { Name = "Men's Haircut", Slug = "mens-haircut", CategoryId = cat.Id, ProviderId = provider.Id, Price = 199, Description = "Standard haircut for men.", Duration = 30 });
                    servicesList.Add(new Service { Name = "Women's Haircut", Slug = "womens-haircut", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Description = "Standard haircut and blow dry for women.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Facial (Gold)", Slug = "facial-gold", CategoryId = cat.Id, ProviderId = provider.Id, Price = 899, Discount = 100, Description = "Gold facial for glowing skin.", Duration = 60, IsFeatured = true });
                    servicesList.Add(new Service { Name = "Manicure", Slug = "manicure", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "Standard manicure service.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Pedicure", Slug = "pedicure", CategoryId = cat.Id, ProviderId = provider.Id, Price = 599, Description = "Standard pedicure service.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Head Massage", Slug = "head-massage", CategoryId = cat.Id, ProviderId = provider.Id, Price = 299, Description = "Relaxing head massage with oil.", Duration = 30 });
                }
                else if (cat.Slug == "automotive")
                {
                    servicesList.Add(new Service { Name = "Hatchback Wash", Slug = "hatchback-wash", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Description = "Exterior wash and interior vacuum for hatchback.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Sedan Wash", Slug = "sedan-wash", CategoryId = cat.Id, ProviderId = provider.Id, Price = 499, Description = "Exterior wash and interior vacuum for sedan.", Duration = 60 });
                    servicesList.Add(new Service { Name = "SUV Wash", Slug = "suv-wash", CategoryId = cat.Id, ProviderId = provider.Id, Price = 599, Description = "Exterior wash and interior vacuum for SUV.", Duration = 75 });
                    servicesList.Add(new Service { Name = "Car Polishing", Slug = "car-polish", CategoryId = cat.Id, ProviderId = provider.Id, Price = 1299, Description = "Exterior buffing and polishing.", Duration = 120, IsFeatured = true });
                }
                else if (cat.Slug == "pest-control")
                {
                    servicesList.Add(new Service { Name = "Cockroach Control", Slug = "cockroach-control", CategoryId = cat.Id, ProviderId = provider.Id, Price = 899, Description = "Gel and spray treatment for cockroaches.", Duration = 45 });
                    servicesList.Add(new Service { Name = "Termite Treatment", Slug = "termite-control", CategoryId = cat.Id, ProviderId = provider.Id, Price = 2999, Description = "Anti-termite drilling and chemical treatment.", Duration = 120 });
                    servicesList.Add(new Service { Name = "Bed Bug Control", Slug = "bedbug-control", CategoryId = cat.Id, ProviderId = provider.Id, Price = 1499, Description = "Treatment for bed bugs.", Duration = 90 });
                }
                else if (cat.Slug == "appliance-repair")
                {
                    servicesList.Add(new Service { Name = "Fridge Repair", Slug = "fridge-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 299, Description = "Diagnosis and repair of refrigerators.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Washing Machine Repair", Slug = "washing-machine-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 349, Description = "Repairing front/top load washing machines.", Duration = 60 });
                    servicesList.Add(new Service { Name = "Microwave Repair", Slug = "microwave-repair", CategoryId = cat.Id, ProviderId = provider.Id, Price = 249, Description = "Repairing microwaves.", Duration = 45 });
                    servicesList.Add(new Service { Name = "RO Service", Slug = "ro-service", CategoryId = cat.Id, ProviderId = provider.Id, Price = 399, Description = "Filter change and servicing of RO.", Duration = 45 });
                }
            }

            context.Services.AddRange(servicesList);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
        Console.WriteLine(ex.ToString()); // Print to console for visibility
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve static files from 'wwwroot/uploads' and map to '/uploads' if needed, 
// OR just use default UseStaticFiles if we put them in wwwroot/uploads and want to access via host/uploads
app.UseDefaultFiles(); // Added to serve index.html by default
app.UseStaticFiles(); 

app.UseCors("AllowClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NakaeWorks.Backend.Hubs.NotificationHub>("/notificationHub");

app.MapFallbackToFile("index.html"); // Added to serve SPA routing

app.Run();
