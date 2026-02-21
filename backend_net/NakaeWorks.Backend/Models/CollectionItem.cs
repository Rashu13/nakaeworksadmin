using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

public class CollectionItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CollectionId { get; set; }
    [ForeignKey("CollectionId")]
    public Collection Collection { get; set; } = null!;

    [Required]
    public long ServiceId { get; set; }
    [ForeignKey("ServiceId")]
    public Service Service { get; set; } = null!;

    public int Position { get; set; } = 0;
}
