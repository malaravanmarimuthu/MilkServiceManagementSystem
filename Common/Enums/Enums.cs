namespace Common.Enums
{

    public enum OrganizationStatus : int
    {
        None = 0,
        Pending = 1,
        Approved = 2,
        InActive = 3,
        Rejected = 4,
    }

    public enum EmployeeStatus : int
    {
        None = 0,
        Available = 1,
        OnTrip = 2,
        UnAvailable = 3,
        Leave = 4,
        Deleted = 5,
    }
}
