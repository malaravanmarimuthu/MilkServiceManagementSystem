/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getSubscriptions } from "../Services/SubscriptionService";
import { getEmployees } from "../Services/EmployeeService";
import { LeaveRequestService } from "../Services/LeaveRequestService";
import { getProfilePhotoUrl } from "../Services/ProfilePhotoService";
import { MilkEntryService } from "../Services/MilkEntryService";
import Loader from "../Components/Common/Loader";

interface JwtPayload {
    username: string;
    firstname: string;
    userid: string;
    rolename: string;
}

function Dashboard() {
    const token = localStorage.getItem("token");

    let firstName = "";
    let userId = 0;
    let isAdmin = false;

    if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        firstName = decoded.firstname;
        userId = Number(decoded.userid);
        isAdmin = decoded.rolename?.toLowerCase() === "admin";
    }

    const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const [activeCustomers, setActiveCustomers] = useState(0);
    const [activeFarmers, setActiveFarmers] = useState(0);
    const [todayLeaves, setTodayLeaves] = useState(0);
    const [pendingLeaves, setPendingLeaves] = useState(0);

    useEffect(() => {
        loadProfilePhoto();
        if (isAdmin) {
            loadAdminStats();
        } else {
            loadUserSubscriptions();
        }
    }, []);

    const loadProfilePhoto = async () => {
        try {
            const url = await getProfilePhotoUrl(userId);
            setPhotoUrl(url ? `${url}?t=${Date.now()}` : null);
        } catch {
            setPhotoUrl(null);
        }
    };

    const loadAdminStats = async () => {
        try {
            setLoading(true);

            // ---- Employees (Customers & Farmers by role) ----
            const empRes: any = await getEmployees();
            const empData = empRes?.data;
            const empArr = Array.isArray(empData)
                ? empData
                : empData?.$values ?? empData?.data ?? [];

            const roleNameOf = (e: any) => (e.roleName ?? e.RoleName ?? "").toLowerCase();

            const customerCount = empArr.filter((e: any) =>
                roleNameOf(e).includes("customer")
            ).length;

            const farmerCount = empArr.filter((e: any) =>
                roleNameOf(e).includes("farmer")
            ).length;

            setActiveCustomers(customerCount);
            setActiveFarmers(farmerCount);

            // ---- Leave Requests (Approved only, covering today) ----
            const leaveData: any = await LeaveRequestService.getAll();
            const leaveArr = Array.isArray(leaveData)
                ? leaveData
                : leaveData?.$values ?? leaveData?.data ?? [];

            const today = new Date().toISOString().split("T")[0];

            const employeesOnLeaveToday = new Set<number>();

            leaveArr.forEach((l: any) => {
                const status = (l.status ?? l.Status ?? "").toLowerCase().trim();
                if (status !== "approved") return;

                const from = (l.fromDate ?? l.FromDate ?? "").split("T")[0];
                const rawTo = l.toDate ?? l.ToDate;
                const to = rawTo && rawTo !== "Ongoing" ? rawTo.split("T")[0] : today;

                if (today >= from && today <= to) {
                    const empId = l.employeeID ?? l.employeeId ?? l.EmployeeId;
                    if (empId) employeesOnLeaveToday.add(Number(empId));
                }
            });

            // ---- Milk Entries marked as "Leave" for today ----
            try {
                const milkArr = await MilkEntryService.getAll();

                milkArr.forEach((m) => {
                    const entryType = (m.entryType ?? "").toLowerCase();
                    const entryDate = (m.entryDate ?? "").split("T")[0];

                    if (entryType === "leave" && entryDate === today) {
                        const empId = m.employeeID;
                        if (empId) employeesOnLeaveToday.add(Number(empId));
                    }
                });
            } catch (err) {
                console.error("Failed to load milk entries for leave count", err);
            }

            setTodayLeaves(employeesOnLeaveToday.size);

            const pending = leaveArr.filter(
                (l: any) => (l.status ?? l.Status ?? "").toLowerCase().trim() === "pending"
            );
            setPendingLeaves(pending.length);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserSubscriptions = async () => {
        try {
            setLoading(true);
            const empSubData: any = await getEmployeeSubscriptions();
            const allEmpSubs = Array.isArray(empSubData)
                ? empSubData
                : empSubData?.$values ?? empSubData?.data ?? [];

            const mySubs = allEmpSubs.filter((x: any) => x.employeeId === userId);

            const subData: any = await getSubscriptions();
            const allSubs = Array.isArray(subData)
                ? subData
                : subData?.$values ?? subData?.data ?? [];

            setUserSubscriptions(mySubs);
            setSubscriptions(allSubs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getSubscriptionName = (id: number) => {
        const sub = subscriptions.find(
            (x: any) =>
                (x.subscriptionID ?? x.subscriptionId ?? x.SubscriptionID ?? x.SubscriptionId) === id
        );
        return sub?.milkType ?? sub?.MilkType ?? id;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const activeCount = userSubscriptions.filter(
        (x) => (x.status ?? "").toLowerCase() === "active"
    ).length;

    const inactiveCount = userSubscriptions.filter(
        (x) => (x.status ?? "").toLowerCase() === "inactive"
    ).length;

    const freezeCount = userSubscriptions.filter(
        (x) => (x.status ?? "").toLowerCase() === "freeze"
    ).length;

    const getStatusBadge = (status: string) => {
        const s = (status ?? "").toLowerCase();
        if (s === "active") return { bg: "#dcfce7", color: "#166534", label: "✓ Active" };
        if (s === "freeze") return { bg: "#e0f2fe", color: "#075985", label: "❄️ Freeze" };
        return { bg: "#fee2e2", color: "#991b1b", label: "✗ Inactive" };
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>

            {/* Hero Banner */}
            <div style={{
                background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #52B788 100%)",
                padding: "48px 32px 64px",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: "-40px", right: "-40px",
                    width: "200px", height: "200px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)"
                }} />
                <div style={{
                    position: "absolute", bottom: "-60px", left: "10%",
                    width: "300px", height: "300px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)"
                }} />

                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div style={{
                            width: "56px", height: "56px", borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            border: "2px solid rgba(255,255,255,0.4)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.5rem", fontWeight: 700, color: "#fff",
                            overflow: "hidden",
                        }}>
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                />
                            ) : (
                                firstName?.[0]?.toUpperCase() ?? "U"
                            )}
                        </div>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem" }}>
                                {getGreeting()} 👋
                            </p>
                            <h2 style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: "1.6rem" }}>
                                {firstName}
                            </h2>
                        </div>
                    </div>

                    {isAdmin && (
                        <span style={{
                            background: "rgba(255,255,255,0.15)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "20px",
                            padding: "4px 14px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                        }}>
                            🛡️ Administrator
                        </span>
                    )}
                </div>
            </div>

            <div className="container" style={{ marginTop: "-32px", position: "relative", zIndex: 2, paddingBottom: "48px" }}>


                {isAdmin && (
                    <>
                        {loading ? (
                            <div className="mt-4"><Loader /></div>
                        ) : (
                            <>

                                <div className="row g-3 mb-4 mt-1">
                                    {[
                                        {
                                            icon: "🧑‍🤝‍🧑",
                                            label: "Active Customers",
                                            value: activeCustomers,
                                            bg: "#1B4332",
                                            light: "#e8f5e9",
                                            link: "/employee",
                                        },
                                        {
                                            icon: "🧑‍🌾",
                                            label: "Active Farmers",
                                            value: activeFarmers,
                                            bg: "#166534",
                                            light: "#dcfce7",
                                            link: "/employee",
                                        },
                                        {
                                            icon: "📋",
                                            label: "Today's Leaves",
                                            value: todayLeaves,
                                            bg: "#92400e",
                                            light: "#fef3c7",
                                            link: "/leave-request",
                                        },
                                        {
                                            icon: "⏳",
                                            label: "Pending Approvals",
                                            value: pendingLeaves,
                                            bg: "#1e40af",
                                            light: "#dbeafe",
                                            link: "/leave-request",
                                        },
                                    ].map((stat, i) => (
                                        <div className="col-md-3 col-6" key={i}>
                                            <div
                                                className="card border-0 h-100"
                                                style={{
                                                    borderRadius: "16px",
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                                    cursor: "pointer",
                                                    transition: "transform 0.2s",
                                                }}
                                                onClick={() => window.location.href = stat.link}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
                                            >
                                                <div className="card-body text-center p-4">
                                                    <div style={{
                                                        width: "48px", height: "48px",
                                                        borderRadius: "12px",
                                                        background: stat.light,
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "1.4rem",
                                                        margin: "0 auto 12px",
                                                    }}>
                                                        {stat.icon}
                                                    </div>
                                                    <div style={{
                                                        fontSize: "2rem",
                                                        fontWeight: 800,
                                                        color: stat.bg,
                                                        lineHeight: 1,
                                                        marginBottom: "6px",
                                                    }}>
                                                        {stat.value}
                                                    </div>
                                                    <div style={{
                                                        fontSize: "0.8rem",
                                                        color: "#6b7280",
                                                        fontWeight: 600,
                                                    }}>
                                                        {stat.label}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    height: "4px",
                                                    background: stat.bg,
                                                    borderRadius: "0 0 16px 16px",
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="row g-4">
                                    {[
                                        {
                                            icon: "🥛",
                                            label: "Manage Subscriptions",
                                            desc: "Add, edit or remove milk subscription plans",
                                            color: "#1B4332",
                                            link: "/subscription",
                                        },
                                        {
                                            icon: "👥",
                                            label: "Manage Users",
                                            desc: "View and manage all user records",
                                            color: "#1e40af",
                                            link: "/employee",
                                        },
                                        {
                                            icon: "📋",
                                            label: "Leave Requests",
                                            desc: "Review and approve leave requests",
                                            color: "#92400e",
                                            link: "/leave-request",
                                        },
                                    ].map((card, i) => (
                                        <div className="col-md-4" key={i}>
                                            <div
                                                className="card border-0 h-100"
                                                style={{
                                                    borderRadius: "16px",
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                                    cursor: "pointer",
                                                    transition: "transform 0.2s, box-shadow 0.2s",
                                                }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                                                }}
                                                onClick={() => window.location.href = card.link}
                                            >
                                                <div className="card-body p-4">
                                                    <div style={{
                                                        width: "48px", height: "48px",
                                                        borderRadius: "12px",
                                                        background: card.color + "18",
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "1.4rem",
                                                        marginBottom: "16px",
                                                    }}>
                                                        {card.icon}
                                                    </div>
                                                    <h6 style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: "6px" }}>
                                                        {card.label}
                                                    </h6>
                                                    <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                                                        {card.desc}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    height: "4px",
                                                    background: card.color,
                                                    borderRadius: "0 0 16px 16px",
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* ✅ User View */}
                {!isAdmin && (
                    <>
                        <div className="row g-3 mb-4">
                            {[
                                { label: "Total", value: userSubscriptions.length, icon: "🥛", bg: "#1B4332", light: "#e8f5e9" },
                                { label: "Active", value: activeCount, icon: "✅", bg: "#166534", light: "#dcfce7" },
                                { label: "Inactive", value: inactiveCount, icon: "⏸️", bg: "#991b1b", light: "#fee2e2" },
                                { label: "Freeze", value: freezeCount, icon: "❄️", bg: "#075985", light: "#e0f2fe" },
                            ].map((stat, i) => (
                                <div className="col-3" key={i}>
                                    <div className="card border-0 text-center" style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                                        <div className="card-body py-3 px-2">
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "10px",
                                                background: stat.light,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "1.1rem", margin: "0 auto 8px",
                                            }}>
                                                {stat.icon}
                                            </div>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.bg }}>
                                                {stat.value}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card border-0" style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                            <div className="card-header border-0 d-flex align-items-center gap-2" style={{ background: "#fff", padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0" }}>
                                <span style={{ fontSize: "1.1rem" }}>🥛</span>
                                <h6 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>My Subscriptions</h6>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-4"><Loader /></div>
                                ) : userSubscriptions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍼</div>
                                        <p style={{ color: "#9ca3af", fontWeight: 500 }}>No subscriptions found.</p>
                                    </div>
                                ) : (
                                    <table className="table mb-0" style={{ fontSize: "0.9rem" }}>
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase" }}>Subscription</th>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase" }}>Quantity</th>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase" }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userSubscriptions.map((item: any, index: number) => {
                                                const badge = getStatusBadge(item.status);
                                                return (
                                                    <tr key={item.employeeSubscriptionId || index} style={{ borderTop: "1px solid #f3f4f6" }}>
                                                        <td style={{ padding: "14px 24px", border: "none", fontWeight: 600, color: "#1a1a2e" }}>
                                                            <span style={{ marginRight: "8px" }}>
                                                                {getSubscriptionName(item.subscriptionId) === "Cow" ? "🐄" : "🐃"}
                                                            </span>
                                                            {getSubscriptionName(item.subscriptionId)}
                                                        </td>
                                                        <td style={{ padding: "14px 24px", border: "none", color: "#374151" }}>{item.quantity} L</td>
                                                        <td style={{ padding: "14px 24px", border: "none" }}>
                                                            <span style={{
                                                                padding: "4px 12px", borderRadius: "20px",
                                                                fontSize: "0.78rem", fontWeight: 600,
                                                                background: badge.bg, color: badge.color,
                                                            }}>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;