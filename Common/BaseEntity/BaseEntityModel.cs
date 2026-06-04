namespace Common.BaseEntity;
public abstract class BaseEntityModel : IBaseEntityModel
{
    public virtual long ID { get; set; }
    public virtual DateTime CreatedDate { get; set; }
    public virtual long CreatedBy { get; set; }
    public virtual DateTime? UpdatedDate { get; set; }
    public virtual long? UpdatedBy { get; set; }
    public virtual DateTime? DeletedDate { get; set; }
    public virtual long? DeletedBy { get; set; }
    public virtual string? RegionCode { get; set; }
}
