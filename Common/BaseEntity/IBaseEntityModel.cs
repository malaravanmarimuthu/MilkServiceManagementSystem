namespace Common.BaseEntity;

public interface IBaseEntityModel
{
    long ID { get; set; }
    DateTime CreatedDate { get; set; }
    long CreatedBy { get; set; }
    DateTime? UpdatedDate { get; set; }
    long? UpdatedBy { get; set; }
    DateTime? DeletedDate { get; set; }
    long? DeletedBy { get; set; }
}
