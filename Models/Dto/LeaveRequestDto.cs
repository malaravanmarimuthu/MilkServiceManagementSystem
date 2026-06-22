public class LeaveRequestDto
{
    public long LeaveRequestID { get; set; }
    public long EmployeeID { get; set; }
    public string? EmployeeName { get; set; }
    public string LeaveType { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
}