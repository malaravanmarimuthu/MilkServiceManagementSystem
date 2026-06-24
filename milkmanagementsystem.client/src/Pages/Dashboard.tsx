/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getSubscriptions } from "../Services/SubscriptionService";
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
        isAdmin = decoded.rolename === "Admin";
    }

    const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            loadUserSubscriptions();
        }
    }, []);

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
            <div
                style={{
                    background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #52B788 100%)",
                    padding: "48px 32px 64px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
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
                        }}>
                            {firstName?.[0]?.toUpperCase() ?? "U"}
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

                {/* Admin View */}
                {isAdmin && (
                    <div className="row g-4 mt-1">
                        {[
                            { icon: "🥛", label: "Manage Subscriptions", desc: "Add, edit or remove milk subscription plans", color: "#1B4332", link: "/subscription" },
                            { icon: "👥", label: "Manage Employees", desc: "View and manage all employee records", color: "#1e40af", link: "/employees" },
                            { icon: "📋", label: "Leave Requests", desc: "Review and approve employee leave requests", color: "#92400e", link: "/leaverequest" },
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
                                            width: "48px", height: "48px", borderRadius: "12px",
                                            background: card.color + "18",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.4rem", marginBottom: "16px",
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
                )}

                {/* User View */}
                {!isAdmin && (
                    <>
                        {/* Stats Cards */}
                        <div className="row g-3 mb-4">
                            {[
                                {
                                    label: "Total",
                                    value: userSubscriptions.length,
                                    icon: "🥛",
                                    bg: "#1B4332",
                                    light: "#e8f5e9",
                                },
                                {
                                    label: "Active",
                                    value: activeCount,
                                    icon: "✅",
                                    bg: "#166534",
                                    light: "#dcfce7",
                                },
                                {
                                    label: "Inactive",
                                    value: inactiveCount,
                                    icon: "⏸️",
                                    bg: "#991b1b",
                                    light: "#fee2e2",
                                },
                                {
                                    label: "Freeze",
                                    value: freezeCount,
                                    icon: "❄️",
                                    bg: "#075985",
                                    light: "#e0f2fe",
                                },
                            ].map((stat, i) => (
                                <div className="col-3" key={i}>
                                    <div
                                        className="card border-0 text-center"
                                        style={{
                                            borderRadius: "16px",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                                            background: "#fff",
                                        }}
                                    >
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

                        {/* Subscriptions Table Card */}
                        <div
                            className="card border-0"
                            style={{
                                borderRadius: "16px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                className="card-header border-0 d-flex align-items-center gap-2"
                                style={{
                                    background: "#fff",
                                    padding: "20px 24px 16px",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            >
                                <span style={{ fontSize: "1.1rem" }}>🥛</span>
                                <h6 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>
                                    My Subscriptions
                                </h6>
                            </div>

                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-4">
                                        <Loader text="Loading Subscriptions..." />
                                    </div>
                                ) : userSubscriptions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍼</div>
                                        <p style={{ color: "#9ca3af", fontWeight: 500 }}>
                                            No subscriptions found.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="table mb-0" style={{ fontSize: "0.9rem" }}>
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    Subscription
                                                </th>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    Quantity
                                                </th>
                                                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 600, border: "none", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userSubscriptions.map((item: any, index: number) => {
                                                const badge = getStatusBadge(item.status);
                                                return (
                                                    <tr
                                                        key={item.employeeSubscriptionId || index}
                                                        style={{ borderTop: "1px solid #f3f4f6" }}
                                                    >
                                                        <td style={{ padding: "14px 24px", border: "none", fontWeight: 600, color: "#1a1a2e" }}>
                                                            <span style={{ marginRight: "8px" }}>
                                                                {getSubscriptionName(item.subscriptionId) === "Cow" ? "🐄" : "🐃"}
                                                            </span>
                                                            {getSubscriptionName(item.subscriptionId)}
                                                        </td>
                                                        <td style={{ padding: "14px 24px", border: "none", color: "#374151" }}>
                                                            {item.quantity} L
                                                        </td>
                                                        <td style={{ padding: "14px 24px", border: "none" }}>
                                                            <span style={{
                                                                padding: "4px 12px",
                                                                borderRadius: "20px",
                                                                fontSize: "0.78rem",
                                                                fontWeight: 600,
                                                                background: badge.bg,
                                                                color: badge.color,
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