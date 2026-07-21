using System.ComponentModel.DataAnnotations;

public class LookupMaster
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Value { get; set; } = string.Empty;
}