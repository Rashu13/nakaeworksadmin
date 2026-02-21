using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("wallets")]
public class Wallet
{
    [Key]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Balance { get; set; } = 0.00m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("transactions")]
public class Transaction
{
    [Key]
    public long Id { get; set; }

    [Column("wallet_id")]
    public long WalletId { get; set; }
    [ForeignKey("WalletId")]
    public Wallet? Wallet { get; set; }

    [Column("booking_id")]
    public long? BookingId { get; set; } // Optional reference

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Amount { get; set; } = 0.00m;

    [Column(TypeName = "varchar(50)")]
    public string Type { get; set; } = "credit"; // 'credit' or 'debit'

    [MaxLength(255)]
    public string? Detail { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
