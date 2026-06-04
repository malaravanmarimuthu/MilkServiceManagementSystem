namespace Common.BaseDto
{

    public interface IBaseExtendDto
    {
        DateTime? UpdatedDate { get; set; }
        long UpdatedBy { get; set; }
        DateTime? DeletedDate { get; set; }
        long DeletedBy { get; set; }

    }

    public interface IBaseDto : IBaseExtendDto
    {
        public long ID { get; set; }
        public DateTime CreatedDate { get; set; }
        public long CreatedBy { get; set; }
        public string? RegionCode { get; set; }

    }
}
