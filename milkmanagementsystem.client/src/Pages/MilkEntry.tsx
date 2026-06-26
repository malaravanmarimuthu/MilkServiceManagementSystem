/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { getLocations } from "../Services/LocationService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getSubscriptions } from "../Services/SubscriptionService";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import { getEmployees } from "../Services/EmployeeService";
import { LeaveRequestService } from "../Services/LeaveRequestService"; 

const getTodayStr = () => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
};

const getTodayISO = () => new Date().toISOString().split("T")[0];

const MilkConsumption: React.FC = () => {
    const [locations, setLocations] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [selectedLocationID, setSelectedLocationID] = useState<number>(0);
    const [otherValues, setOtherValues] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savingType, setSavingType] = useState<string>("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]); // ← ADD THIS STATE

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [locData, empSubData, subData, entryData, empData, leaveData] =
                await Promise.all([
                    getLocations(),
                    getEmployeeSubscriptions(),
                    getSubscriptions(),
                    MilkEntryService.getAll(),
                    getEmployees(),
                    LeaveRequestService.getAll(), 
                ]);

            const empArr = Array.isArray(empData.data)
                ? empData.data
                : empData.data?.$values ?? [];
            setEmployees(empArr);

            const locArr = Array.isArray(locData)
                ? locData
                : (locData as any)?.$values ?? [];
            setLocations(locArr);

            const empSubArr = Array.isArray(empSubData)
                ? empSubData
                : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? [];
            setEmpSubscriptions(empSubArr);

            const subArr = Array.isArray(subData)
                ? subData
                : (subData as any)?.$values ?? (subData as any)?.data ?? [];
            setSubscriptions(subArr);

            const entryArr = Array.isArray(entryData)
                ? entryData
                : (entryData as any)?.$values ?? [];
            setEntries(entryArr);

            
            const leaveArr = Array.isArray(leaveData)
                ? leaveData
                : (leaveData as any)?.$values ?? (leaveData as any)?.data ?? [];
            setLeaveRequests(leaveArr);
            

        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const getSubName = (subId: number) => {
        const sub = subscriptions.find((s: any) =>
            (s.subscriptionID ?? s.subscriptionId) === subId
        );
        return sub?.milkType ?? sub?.MilkType ?? "Unknown";
    };

    const isOnLeaveToday = (empId: number): boolean => {
        const today = getTodayISO(); 
        return leaveRequests.some((leave: any) => {
            const leaveEmpId = leave.employeeId ?? leave.EmployeeId;
            const status = (leave.status ?? leave.Status ?? "").toLowerCase();
            const fromDate = (leave.fromDate ?? leave.FromDate ?? "").split("T")[0];
            const toDate = leave.toDate ?? leave.ToDate;

            const endDate = toDate && toDate !== "Ongoing"
                ? toDate.split("T")[0]
                : today; 

            return (
                leaveEmpId === empId &&
                status === "approved" &&
                today >= fromDate &&
                today <= endDate
            );
        });
    };

    const activeSubscriptions = empSubscriptions.filter((s: any) =>
        (s.status ?? "").toLowerCase() === "active"
    );

    const filteredSubs =
        selectedLocationID > 0
            ? activeSubscriptions.filter((s: any) => {
                const empId = s.employeeId ?? s.EmployeeId;
                const employee = employees.find((e: any) => (e.id ?? e.ID) === empId);
                const empLocationID = employee?.locationID ?? employee?.LocationID ?? 0;
                return empLocationID === selectedLocationID;
            })
            : activeSubscriptions;

    const handleSave = async (sub: any, type: string, qty: number) => {
        const empId = sub.employeeId ?? sub.EmployeeId;
        const employee = employees.find((e: any) => (e.id ?? e.ID) === empId);
        const empLocationID = employee?.locationID ?? employee?.LocationID ?? selectedLocationID;

        setSavingId(empId);
        setSavingType(type);
        try {
            await MilkEntryService.create({
                milkEntryID: 0,
                employeeID: empId,
                locationID: empLocationID,
                entryDate: getTodayISO(),
                entryType: type,
                quantity: qty,
                notes: type === "Other" ? String(qty) : "",
            });
            setSuccess(`${type} entry saved!`);
            fetchAll();
        } catch {
            setError("Failed to save entry.");
        } finally {
            setSavingId(null);
            setSavingType("");
        }
    };

    const todayEntries = entries.filter(
        (e) => e.entryDate?.split("T")[0] === getTodayISO()
    );

    const hasEntry = (empId: number) =>
        todayEntries.some((e) => e.employeeID === empId);

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />

            <div className="container-fluid mt-3 px-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Milk Entry</h4>
                    <div className="d-flex gap-3 align-items-center">
                        <select
                            className="form-select"
                            style={{ width: "200px" }}
                            value={selectedLocationID}
                            onChange={(e) => setSelectedLocationID(Number(e.target.value))}
                        >
                            <option value={0}>-- All Locations --</option>
                            {locations.map((loc: any) => {
                                const id = loc.locationID ?? loc.LocationID;
                                const name = loc.locationName ?? loc.LocationName;
                                return (
                                    <option key={id} value={id}>{name}</option>
                                );
                            })}
                        </select>
                        <div
                            className="px-3 py-2 rounded-3 fw-semibold"
                            style={{ background: "#1B4332", color: "#fff", fontSize: "0.9rem" }}
                        >
                            {getTodayStr()}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <Loader text="Loading milk entries..." />
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>Employee</th>
                                    <th>Subscription</th>
                                    <th>Qty (L)</th>
                                    <th style={{ width: "320px" }}>Entry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-4">
                                            No active subscriptions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubs.map((sub: any, index: number) => {
                                        const empId = sub.employeeId ?? sub.EmployeeId;
                                        const subId = sub.subscriptionId ?? sub.SubscriptionId;
                                        const qty = sub.quantity ?? 0;
                                        const employee = employees.find((e: any) => (e.id ?? e.ID) === empId);
                                        const empName = employee
                                            ? `${employee.firstName ?? employee.FirstName} ${employee.lastName ?? employee.LastName}`
                                            : `Emp #${empId}`;
                                        const isSaving = savingId === empId;
                                        const done = hasEntry(empId);
                                        const onLeave = isOnLeaveToday(empId); 

                                        const rowBg = onLeave
                                            ? "#ffe5e5"   
                                            : done
                                                ? "#f0fff4" 
                                                : "";

                                        return (
                                            <tr key={index} style={{ background: rowBg }}>
                                                <td>
                                                    <div className="fw-semibold" style={{ color: onLeave ? "#c0392b" : "" }}>
                                                        {empName}
                                                        {/* ── LEAVE BADGE ───────────────── */}
                                                        {onLeave && (
                                                            <span
                                                                className="ms-2 badge"
                                                                style={{ background: "#c0392b", fontSize: "0.7rem" }}
                                                            >
                                                                On Leave
                                                            </span>
                                                        )}
                                                        {/* ──────────────────────────────── */}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                        ID: {empId}
                                                    </div>
                                                </td>
                                                <td>{getSubName(subId)}</td>
                                                <td className="fw-bold">{qty} L</td>
                                                <td>
                                                    {done ? (
                                                        <span className="text-success fw-semibold">
                                                            ✓ Entry saved for today
                                                        </span>
                                                    ) : (
                                                        <div className="d-flex gap-2 align-items-center flex-wrap">

                                                            {!onLeave && (
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    disabled={isSaving}
                                                                    onClick={() => handleSave(sub, "Actual", qty)}
                                                                >
                                                                    {isSaving && savingType === "Actual"
                                                                        ? <span className="spinner-border spinner-border-sm" />
                                                                        : "Actual"
                                                                    }
                                                                </button>
                                                            )}

                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                disabled={isSaving}
                                                                onClick={() => handleSave(sub, "Leave", 0)}
                                                            >
                                                                {isSaving && savingType === "Leave"
                                                                    ? <span className="spinner-border spinner-border-sm" />
                                                                    : "Leave"
                                                                }
                                                            </button>

                                                            {!onLeave && (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        style={{ width: "70px" }}
                                                                        placeholder="Other"
                                                                        value={otherValues[empId] ?? ""}
                                                                        min={0}
                                                                        onChange={(e) =>
                                                                            setOtherValues((prev) => ({
                                                                                ...prev,
                                                                                [empId]: e.target.value,
                                                                            }))
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        disabled={isSaving || !otherValues[empId]}
                                                                        onClick={() => {
                                                                            handleSave(sub, "Other", Number(otherValues[empId]));
                                                                            setOtherValues((prev) => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isSaving && savingType === "Other"
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : "Submit"
                                                                        }
                                                                    </button>
                                                                </>
                                                            )}

                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default MilkConsumption;