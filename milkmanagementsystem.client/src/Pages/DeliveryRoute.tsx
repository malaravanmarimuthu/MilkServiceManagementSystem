/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { getEmployees, type Employee } from "../Services/EmployeeService";

interface RouteStop extends Employee {
    sequenceOrder: number;
    distanceFromPrevKm: number;
}

const BRAND = "#1B4332";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const haversineKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const DeliveryRoute: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("Geolocation not supported on this device.");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    }),
                () => reject("Location access denied. Please enable location permission."),
                { enableHighAccuracy: true }
            );
        });
    };

    const buildRoute = useCallback(
        async (locatedEmployees: Employee[]) => {
            try {
                const origin = await getCurrentLocation();

                const remaining = [...locatedEmployees];
                const ordered: RouteStop[] = [];
                let curLat = origin.lat;
                let curLng = origin.lng;

                while (remaining.length > 0) {
                    let nearestIdx = -1;
                    let nearestDist = Infinity;

                    remaining.forEach((emp, idx) => {
                        const d = haversineKm(
                            curLat,
                            curLng,
                            emp.latitude as number,
                            emp.longitude as number
                        );
                        if (d < nearestDist) {
                            nearestDist = d;
                            nearestIdx = idx;
                        }
                    });

                    const nearest = remaining[nearestIdx];
                    ordered.push({
                        ...nearest,
                        sequenceOrder: ordered.length + 1,
                        distanceFromPrevKm: Math.round(nearestDist * 100) / 100,
                    });
                    curLat = nearest.latitude as number;
                    curLng = nearest.longitude as number;
                    remaining.splice(nearestIdx, 1);
                }

                setRouteStops(ordered);
            } catch (err) {
                setError(
                    typeof err === "string" ? err : "Unable to build the route."
                );
            }
        },
        []
    );

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getEmployees();
                const list: Employee[] = Array.isArray(res.data)
                    ? res.data
                    : res.data?.$values ?? [];
                setEmployees(list);

                const located = list.filter(
                    (e) => e.latitude != null && e.longitude != null
                );

                if (located.length > 0) {
                    await buildRoute(located);
                }
            } catch (err) {
                setError("Unable to load employee data.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [buildRoute]);

    const handleDirection = (lat: number, lng: number) => {
        if (!navigator.geolocation) {
            alert("Location not supported on this device.");
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
            const destination = `${lat},${lng}`;
            window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
                "_blank"
            );
        });
    };

    const handleStartNavigation = () => {
        if (routeStops.length === 0) return;
        const first = routeStops[0];
        handleDirection(first.latitude as number, first.longitude as number);
    };

    const locatedCount = employees.filter(
        (e) => e.latitude != null && e.longitude != null
    ).length;

    const totalDistance = routeStops
        .reduce((sum, s) => sum + s.distanceFromPrevKm, 0)
        .toFixed(2);

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <div>
                    <h2 className="mb-1" style={{ color: BRAND, fontWeight: 700 }}>
                        Delivery Route
                    </h2>
                </div>

                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleStartNavigation}
                    disabled={routeStops.length === 0}
                >
                    Start Navigation
                </button>
            </div>

            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

            {/* Stat cards */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small">Total Employees</div>
                            <div className="fs-3 fw-bold" style={{ color: BRAND }}>
                                {employees.length}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small">Location Set</div>
                            <div className="fs-3 fw-bold" style={{ color: BRAND }}>
                                {locatedCount}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small">Route Stops</div>
                            <div className="fs-3 fw-bold" style={{ color: BRAND }}>
                                {routeStops.length}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small">Total Distance</div>
                            <div className="fs-3 fw-bold" style={{ color: BRAND }}>
                                {routeStops.length > 0 ? `${totalDistance} km` : "—"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route table */}
            <div className="card border-0 shadow-sm">
                <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: BRAND, color: "#fff" }}
                >
                    <span className="fw-semibold">Optimized Route Order</span>
                    <span className="badge bg-light text-dark">
                        {routeStops.length} stops · {totalDistance} km
                    </span>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Distance from Prev</th>
                                <th style={{ width: 140 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            style={{ color: BRAND }}
                                        />
                                        Calculating optimized route...
                                    </td>
                                </tr>
                            ) : routeStops.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">
                                        No employees with location set found.
                                    </td>
                                </tr>
                            ) : (
                                routeStops.map((s) => (
                                    <tr key={s.id}>
                                        
                                        <td className="fw-medium">
                                            {s.firstName} {s.lastName}
                                        </td>
                                        <td className="text-muted">{s.mobile}</td>
                                        <td>{s.distanceFromPrevKm} km</td>
                                        <td>
                                            <button
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() =>
                                                    handleDirection(
                                                        s.latitude as number,
                                                        s.longitude as number
                                                    )
                                                }
                                            >
                                                Direction
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeliveryRoute;