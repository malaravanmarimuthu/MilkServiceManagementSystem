namespace Common.BaseDto;

public abstract class BaseExtendDto
{
    
    public DateTime? UpdatedDate { get; set; }
    public long UpdatedBy { get; set; }
    public DateTime? DeletedDate { get; set; }
    public long DeletedBy { get; set; }

}

public abstract class BaseDto :  BaseExtendDto , IBaseDto
{
    public long ID { get; set; }
    public DateTime CreatedDate { get; set; }
    public long CreatedBy { get; set; }
    public virtual string? RegionCode { get; set; }

}