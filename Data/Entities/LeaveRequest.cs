using Data.Entities;
using System.ComponentModel.DataAnnotations.Schema;

public class LeaveRequest
{
    public long LeaveRequestID { get; set; }
    public long EmployeeID { get; set; }
    public string LeaveType { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string Reason { get; set; }
    public string Status { get; set; } = "Pending";

    [ForeignKey("EmployeeID")]
    public virtual Employee Employee { get; set; }
}