/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { getLocations } from "../Services/LocationService";
import { getEmployeeSubscriptions } from "../Services/EmployeeSubscriptionService";
import { getSubscriptions } from "../Services/SubscriptionService";
import { MilkEntryService } from "../Services/MilkEntryService";
import type { MilkEntryDto } from "../Services/MilkEntryService";
import { PaymentService } from "../Services/PaymentService";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import Loader from "../Components/Common/Loader";
import { getEmployees } from "../Services/EmployeeService";
import { LeaveRequestService } from "../Services/LeaveRequestService";

const getTodayStr = () => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
        .toString().padStart(2, "0")}-${d.getFullYear()}`;
};

const getTodayISO = () => new Date().toISOString().split("T")[0];

const MilkConsumption: React.FC = () => {
    const [locations, setLocations] = useState<any[]>([]);
    const [empSubscriptions, setEmpSubscriptions] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [entries, setEntries] = useState<MilkEntryDto[]>([]);
    const [selectedLocationID, setSelectedLocationID] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [payingId, setPayingId] = useState<number | null>(null);
    const [rowType, setRowType] = useState<Record<number, string>>({});
    const [otherQty, setOtherQty] = useState<Record<number, string>>({});
    const [otherAmount, setOtherAmount] = useState<Record<number, string>>({});
    const [actualAmount, setActualAmount] = useState<Record<number, string>>({});

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [locData, empSubData, subData, entryData, empData, leaveData, payData] =
                await Promise.all([
                    getLocations(),
                    getEmployeeSubscriptions(),
                    getSubscriptions(),
                    MilkEntryService.getAll(),
                    getEmployees(),
                    LeaveRequestService.getAll(),
                    PaymentService.getAll(),
                ]);

            setEmployees(Array.isArray(empData.data) ? empData.data : empData.data?.$values ?? []);
            setLocations(Array.isArray(locData) ? locData : (locData as any)?.$values ?? []);
            setEmpSubscriptions(Array.isArray(empSubData) ? empSubData : (empSubData as any)?.$values ?? (empSubData as any)?.data ?? []);
            setSubscriptions(Array.isArray(subData) ? subData : (subData as any)?.$values ?? (subData as any)?.data ?? []);
            setEntries(Array.isArray(entryData) ? entryData : (entryData as any)?.$values ?? []);
            setLeaveRequests(Array.isArray(leaveData) ? leaveData : (leaveData as any)?.$values ?? (leaveData as any)?.data ?? []);
            setPayments(Array.isArray(payData) ? payData : (payData as any)?.$values ?? []);
        } catch {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const getSubName = (subId: number) => {
        const sub = subscriptions.find((s: any) => (s.subscriptionID ?? s.subscriptionId) === subId);
        return sub?.milkType ?? sub?.MilkType ?? "Unknown";
    };

    const getRatePerLiter = (subId: number): number => {
        const sub = subscriptions.find((s: any) => (s.subscriptionID ?? s.subscriptionId) === subId);
        return Number(sub?.pricePerLiter ?? sub?.PricePerLiter ?? 0);
    };

    const isOnLeaveToday = (empId: number): boolean => {
        const today = getTodayISO();
        return leaveRequests.some((leave: any) => {
            const leaveEmpId = leave.employeeId ?? leave.EmployeeId;
            const status = (leave.status ?? leave.Status ?? "").toLowerCase();
            const fromDate = (leave.fromDate ?? leave.FromDate ?? "").split("T")[0];
            const toDate = leave.toDate ?? leave.ToDate;
            const endDate = toDate && toDate !== "Ongoing" ? toDate.split("T")[0] : today;
            return (
                leaveEmpId === empId &&
                (status === "pending" || status === "approved") &&
                today >= fromDate &&
                today <= endDate
            );
        });
    };

    const isPaidToday = (empId: number) => {
        const today = getTodayISO();
        return payments.some((p: any) =>
            p.employeeID === empId && (p.paidDate ?? "").split("T")[0] === today
        );
    };

    const getTodayEntry = (empId: number) =>
        entries.find((e) => e.employeeID === empId && e.entryDate?.split("T")[0] === getTodayISO());

    const hasEntry = (empId: number) => !!getTodayEntry(empId);

    const activeSubscriptions = empSubscriptions.filter((s: any) =>
        (s.status ?? "").toLowerCase() === "active"
    );

    const filteredSubs = (selectedLocationID > 0
        ? activeSubscriptions.filter((s: any) => {
            const emp = employees.find((e: any) => (e.id ?? e.ID) === (s.employeeId ?? s.EmployeeId));
            return (emp?.locationID ?? emp?.LocationID ?? 0) === selectedLocationID;
        })
        : activeSubscriptions
    ).sort((a: any, b: any) => {
        const idA = a.employeeId ?? a.EmployeeId;
        const idB = b.employeeId ?? b.EmployeeId;
        const empA = employees.find((e: any) => (e.id ?? e.ID) === idA);
        const empB = employees.find((e: any) => (e.id ?? e.ID) === idB);
        const nameA = `${empA?.firstName ?? ""} ${empA?.lastName ?? ""}`.trim();
        const nameB = `${empB?.firstName ?? ""} ${empB?.lastName ?? ""}`.trim();
        const leaveA = isOnLeaveToday(idA) ? 0 : 1;
        const leaveB = isOnLeaveToday(idB) ? 0 : 1;
        if (leaveA !== leaveB) return leaveA - leaveB;
        return nameA.localeCompare(nameB);
    });


    const handleSave = async (
        sub: any,
        type: string,
        qty: number,
        withPay: boolean,
        customAmount: number = 0
    ) => {
        const empId = sub.employeeId ?? sub.EmployeeId;
        const subId = sub.subscriptionId ?? sub.SubscriptionId;
        const emp = employees.find((e: any) => (e.id ?? e.ID) === empId);
        const locId = emp?.locationID ?? emp?.LocationID ?? selectedLocationID;
        const rate = getRatePerLiter(subId);
        const payAmount = customAmount > 0 ? customAmount : qty * rate;

        setSavingId(empId);
        try {
            const entryRes = await MilkEntryService.create({
                milkEntryID: 0,
                employeeID: empId,
                locationID: locId,
                entryDate: getTodayISO(),
                entryType: type,
                quantity: qty,
                notes: type === "Other" ? String(qty) : "",
            });

            if (withPay && type !== "Leave" && payAmount > 0) {
                const milkEntryID = (entryRes as any)?.milkEntryID ?? (entryRes as any)?.MilkEntryID ?? 0;
                await PaymentService.create({
                    employeeID: empId,
                    milkEntryID,
                    quantity: qty,
                    ratePerLiter: rate,
                    totalAmount: payAmount,
                    paidDate: getTodayISO(),
                });
                setSuccess(`Entry saved + ₹${payAmount} paid!`);
            } else {
                setSuccess(`${type} entry saved!`);
            }
            fetchAll();
        } catch {
            setError("Failed to save.");
        } finally {
            setSavingId(null);
        }
    };

    const handlePayOnly = async (empId: number, entry: MilkEntryDto, amount: number) => {
        setPayingId(empId);
        try {
            await PaymentService.create({
                employeeID: empId,
                milkEntryID: entry.milkEntryID ?? 0,
                quantity: entry.quantity ?? 0,
                ratePerLiter: 0,
                totalAmount: amount,
                paidDate: getTodayISO(),
            });
            setSuccess(`₹${amount} paid!`);
            fetchAll();
        } catch {
            setError("Payment failed.");
        } finally {
            setPayingId(null);
        }
    };

    return (
        <>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />

            <div className="container-fluid mt-3 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Milk Consumption</h4>
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
                                return <option key={id} value={id}>{name}</option>;
                            })}
                        </select>
                        <div className="px-3 py-2 rounded-3 fw-semibold"
                            style={{ background: "#1B4332", color: "#fff", fontSize: "0.9rem" }}>
                            {getTodayStr()}
                        </div>
                    </div>
                </div>

                {loading ? <Loader text="Loading milk entries..." /> : (
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>Employee</th>
                                    <th>Subscription</th>
                                    <th>Qty (L)</th>
                                    <th style={{ width: "360px" }}>Entry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-4">
                                            No active subscriptions found.
                                        </td>
                                    </tr>
                                ) : filteredSubs.map((sub: any, index: number) => {
                                    const empId = sub.employeeId ?? sub.EmployeeId;
                                    const subId = sub.subscriptionId ?? sub.SubscriptionId;
                                    const qty = sub.quantity ?? 0;
                                    const emp = employees.find((e: any) => (e.id ?? e.ID) === empId);
                                    const empName = emp
                                        ? `${emp.firstName ?? emp.FirstName ?? ""} ${emp.lastName ?? emp.LastName ?? ""}`.trim()
                                        : `Emp #${empId}`;
                                    const onLeave = isOnLeaveToday(empId);
                                    const done = hasEntry(empId);
                                    const paid = isPaidToday(empId);
                                    const todayEntry = getTodayEntry(empId);
                                    const rate = getRatePerLiter(subId);
                                    const isSaving = savingId === empId;
                                    const isPaying = payingId === empId;
                                    const selectedType = rowType[empId] ?? "";
                                    const otherVal = otherQty[empId] ?? "";
                                    const amountVal = otherAmount[empId] ?? "";
                                    const actAmountVal = actualAmount[empId] ?? "";
                                    const rowBg = onLeave ? "#ffe5e5" : done ? "#f0fff4" : "";

                                    return (
                                        <tr key={index} style={{ background: rowBg }}>
                                            <td>
                                                <div className="fw-semibold" style={{ color: onLeave ? "#c0392b" : "" }}>
                                                    {empName}
                                                    {onLeave && (
                                                        <span className="ms-2 badge"
                                                            style={{ background: "#c0392b", fontSize: "0.7rem" }}>
                                                            On Leave
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                    ID: {empId}
                                                </div>
                                            </td>
                                            <td>{getSubName(subId)}</td>
                                            <td className="fw-bold">{qty} L</td>
                                            <td>
                                                {done ? (
                                                    
                                                    <div className="d-flex flex-column gap-1">
                                                        <div className="fw-semibold text-success"
                                                            style={{ fontSize: "0.85rem" }}>
                                                            ✓ {todayEntry?.entryType} — {todayEntry?.quantity} L
                                                        </div>
                                                        {todayEntry?.entryType !== "Leave" && (
                                                            paid ? (
                                                                <span className="badge bg-success"
                                                                    style={{ width: "fit-content" }}>
                                                                    Paid ✓
                                                                </span>
                                                            ) : (
                                                                // ✅ Pay button with amount input
                                                                <div className="d-flex gap-2 align-items-center mt-1">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        style={{ width: "90px" }}
                                                                        placeholder="₹ Amount"
                                                                        value={actualAmount[empId] ?? ""}
                                                                        min={0}
                                                                        onChange={(e) =>
                                                                            setActualAmount(prev => ({ ...prev, [empId]: e.target.value }))
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn btn-sm fw-semibold"
                                                                        style={{ background: "#1B4332", color: "#fff" }}
                                                                        disabled={isPaying || !actAmountVal}
                                                                        onClick={() => {
                                                                            handlePayOnly(empId, todayEntry!, Number(actAmountVal));
                                                                            setActualAmount(prev => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isPaying
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : `Pay ₹${actAmountVal || 0}`
                                                                        }
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    // ✅ Entry not done
                                                    <div className="d-flex flex-column gap-2">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ width: "160px" }}
                                                            value={selectedType}
                                                            onChange={(e) =>
                                                                setRowType(prev => ({ ...prev, [empId]: e.target.value }))
                                                            }
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {!onLeave && <option value="Actual">Actual ({qty} L)</option>}
                                                            <option value="Leave">Leave</option>
                                                            {!onLeave && <option value="Other">Other (Custom)</option>}
                                                        </select>

                                                        {/* ✅ Actual - manual amount */}
                                                        {selectedType === "Actual" && (
                                                            <div className="d-flex flex-column gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    style={{ width: "110px" }}
                                                                    placeholder="₹ Amount"
                                                                    value={actAmountVal}
                                                                    min={0}
                                                                    onChange={(e) =>
                                                                        setActualAmount(prev => ({ ...prev, [empId]: e.target.value }))
                                                                    }
                                                                />
                                                                <div className="d-flex gap-2 flex-wrap">
                                                                    <button
                                                                            className="btn btn-success btn-sm"
                                                                            disabled={isSaving || !!actAmountVal}
                                                                        onClick={() => {
                                                                            handleSave(sub, "Actual", qty, false, 0);
                                                                            setActualAmount(prev => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isSaving
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : "Save"
                                                                        }
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm fw-semibold"
                                                                        style={{ background: "#1B4332", color: "#fff" }}
                                                                        disabled={isSaving || !actAmountVal}
                                                                        onClick={() => {
                                                                            handleSave(sub, "Actual", qty, true, Number(actAmountVal));
                                                                            setActualAmount(prev => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isSaving
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : `Save + Pay ₹${actAmountVal || 0}`
                                                                        }
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ✅ Leave */}
                                                        {selectedType === "Leave" && (
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                disabled={isSaving}
                                                                onClick={() => handleSave(sub, "Leave", 0, false)}
                                                            >
                                                                {isSaving
                                                                    ? <span className="spinner-border spinner-border-sm" />
                                                                    : "Confirm Leave"
                                                                }
                                                            </button>
                                                        )}

                                                        {/* ✅ Other - qty + manual amount */}
                                                        {selectedType === "Other" && (
                                                            <div className="d-flex flex-column gap-2">
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        style={{ width: "75px" }}
                                                                        placeholder="Qty"
                                                                        value={otherVal}
                                                                        min={0}
                                                                        onChange={(e) =>
                                                                            setOtherQty(prev => ({ ...prev, [empId]: e.target.value }))
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        style={{ width: "90px" }}
                                                                        placeholder="₹ Amount"
                                                                        value={amountVal}
                                                                        min={0}
                                                                        onChange={(e) =>
                                                                            setOtherAmount(prev => ({ ...prev, [empId]: e.target.value }))
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="d-flex gap-2 flex-wrap">
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        disabled={isSaving || !otherVal || !!amountVal}
                                                                        onClick={() => {
                                                                            handleSave(sub, "Other", Number(otherVal), false, 0);
                                                                            setOtherQty(prev => ({ ...prev, [empId]: "" }));
                                                                            setOtherAmount(prev => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isSaving
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : "Save"
                                                                        }
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm fw-semibold"
                                                                        style={{ background: "#1B4332", color: "#fff" }}
                                                                        disabled={isSaving || !otherVal || !amountVal}
                                                                        onClick={() => {
                                                                            handleSave(sub, "Other", Number(otherVal), true, Number(amountVal));
                                                                            setOtherQty(prev => ({ ...prev, [empId]: "" }));
                                                                            setOtherAmount(prev => ({ ...prev, [empId]: "" }));
                                                                        }}
                                                                    >
                                                                        {isSaving
                                                                            ? <span className="spinner-border spinner-border-sm" />
                                                                            : `Save + Pay ₹${amountVal || 0}`
                                                                        }
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default MilkConsumption;