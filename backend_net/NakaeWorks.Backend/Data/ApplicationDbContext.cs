using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Models;

namespace NakaeWorks.Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<BookingStatus> BookingStatuses { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingItem> BookingItems { get; set; }
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<UserDocument> UserDocuments { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Coupon> Coupons { get; set; }
    public DbSet<Tax> Taxes { get; set; } // Legacy, might be replaced by SystemSettings or used for complex tax rules
    public DbSet<SystemSetting> SystemSettings { get; set; }
    public DbSet<Banner> Banners { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<CollectionItem> CollectionItems { get; set; }
    public DbSet<BookingActivity> BookingActivities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map 'address' column in addresses table to 'AddressLine' property
        modelBuilder.Entity<Address>()
            .Property(a => a.AddressLine)
            .HasColumnName("address");
            
        // Configure ENUM mapping for User Role is tricky in standard EF without extension
        // We will stick to string for now as defined in the class
        
        // Enum defaults
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasDefaultValue("consumer");
            
        modelBuilder.Entity<Address>()
            .Property(a => a.Type)
            .HasDefaultValue("home");
    }
}
