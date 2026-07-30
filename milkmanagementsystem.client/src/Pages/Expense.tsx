/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { ExpenseService, type ExpenseDto, type CreateExpenseRequest } from "../Services/ExpenseService";
import Loader from "../Components/Common/Loader";
import ErrorModal from "../Components/Common/ErrorModal";
import SuccessModal from "../Components/Common/SuccessModal";
import ConfirmModal from "../Components/Common/ConfirmModal";

const EXPENSE_TYPES = ["Bike", "Salary", "Material", "Others"];

const GREEN = "#1B4332";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_BORDER = "#a5d6a7";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#ccfbf1";
const TEAL_BORDER = "#99f6e4";

const getTypeBadgeStyle = (type: string): CSSProperties => {
    switch (type) {
        case "Bike": return { background: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 };
        case "Salary": return { background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 };
        case "Material": return { background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 };
        default: return { background: "#f3e8ff", color: "#7e22ce", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 };
    }
};

const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    return dateStr;
};

const toDateInputFormat = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 2) {
        const [dd, mm, yyyy] = parts;
        return `${yyyy}-${mm}-${dd}`;
    }
    
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
};

const toSpFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
        const [yyyy, mm, dd] = parts;
        return `${dd}-${mm}-${yyyy}`;
    }
    return dateStr;
};

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Expense: React.FC = () => {
    const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const [filterType, setFilterType] = useState("");
    const [searchText, setSearchText] = useState("");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(currentYear);
    const pickerRef = useRef<HTMLDivElement>(null);

    const dateInputRef = useRef<HTMLInputElement>(null);
    const today = new Date().toISOString().slice(0, 10);

    const emptyForm: CreateExpenseRequest = {
        expenseType: "",
        description: "",
        amount: 0,
        expenseDate: today,
        notes: "",
    };

    const [form, setForm] = useState<CreateExpenseRequest>(emptyForm);

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (showPicker) setPickerYear(selectedYear);
    }, [showPicker]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
                setShowPicker(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const data = await ExpenseService.getAll();
            const arr = Array.isArray(data) ? data : (data as any)?.$values ?? [];
            setExpenses(arr);
        } catch {
            setError("Failed to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!form.expenseType) return setError("Please select expense type.");
        if (!form.description.trim()) return setError("Please enter description.");
        if (!form.amount || form.amount <= 0) return setError("Please enter a valid amount.");
        if (!form.expenseDate) return setError("Please select date.");

        const submitForm: CreateExpenseRequest = {
            ...form,
            expenseDate: toSpFormat(form.expenseDate),
        };

        setSaveLoading(true);
        try {
            if (editingId) {
                await ExpenseService.update(editingId, submitForm);
                setSuccess("Expense updated successfully!");
            } else {
                await ExpenseService.create(submitForm);
                setSuccess("Expense added successfully!");
            }
            setShowForm(false);
            resetForm();
            fetchAll();
        } catch {
            setError("Failed to save expense.");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleEdit = (exp: ExpenseDto) => {
        setForm({
            expenseType: exp.expenseType,
            description: exp.description,
            amount: exp.amount,
            expenseDate: toDateInputFormat(exp.expenseDate), 
            notes: exp.notes ?? "",
        });
        setEditingId(exp.expenseID);
        setShowForm(true);
    };


    const requestDelete = (id: number) => setDeleteTargetId(id);

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        setDeleteLoading(true);
        try {
            await ExpenseService.delete(deleteTargetId);
            setSuccess("Expense deleted.");
            fetchAll();
        } catch {
            setError("Failed to delete expense.");
        } finally {
            setDeleteLoading(false);
            setDeleteTargetId(null);
        }
    };

    const isFutureMonth = (month: number, year: number) => {
        if (year > currentYear) return true;
        if (year === currentYear && month > currentMonth) return true;
        return false;
    };

    const handleMonthSelect = (month: number) => {
        if (isFutureMonth(month, pickerYear)) return;
        setSelectedMonth(month);
        setSelectedYear(pickerYear);
        setShowPicker(false);
    };

    
    const filteredExpenses = expenses.filter((exp) => {
        const raw = exp.expenseDate ?? "";
        let expMonth = 0, expYear = 0;

        
        const parts = raw.split("-");
        if (parts.length === 3 && parts[0].length === 2) {
            expMonth = Number(parts[1]);
            expYear = Number(parts[2]);
        }
        
        else if (raw.includes("/")) {
            const p = raw.split(" ")[0].split("/");
            if (p.length === 3) {
                expMonth = Number(p[0]);
                expYear = Number(p[2]);
            }
        }

        const matchesMonth = expMonth === selectedMonth && expYear === selectedYear;
        const matchesType = !filterType || exp.expenseType === filterType;
        const matchesSearch = !searchText.trim() ||
            exp.description.toLowerCase().includes(searchText.trim().toLowerCase()) ||
            (exp.notes ?? "").toLowerCase().includes(searchText.trim().toLowerCase());
        return matchesMonth && matchesType && matchesSearch;
    });

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div style={{ padding: "24px 32px 60px" }}>
            <ErrorModal message={error} onClose={() => setError("")} />
            <SuccessModal message={success} onClose={() => setSuccess("")} />
            {deleteTargetId !== null && (
                <ConfirmModal
                    title="Delete Expense"
                    message="Are you sure you want to delete this expense?"
                    confirmText={deleteLoading ? "Deleting..." : "Delete"}
                    onConfirm={confirmDelete}
                    onClose={() => setDeleteTargetId(null)}
                    isLoading={deleteLoading}
                />
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-cash-coin" style={{ fontSize: "1.3rem", color: GREEN }} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, margin: 0 }}>Expense Management</h4>
                        <div style={{ fontSize: "0.84rem", color: "#6b7280" }}>Track bike, salary, material & other expenses</div>
                    </div>
                </div>

                {/* Month Picker */}
                <div style={{ position: "relative" }} ref={pickerRef}>
                    <button
                        style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", minWidth: "180px", justifyContent: "space-between" }}
                        onClick={() => setShowPicker(p => !p)}
                    >
                        <span>📅</span>
                        <span>{monthNames[selectedMonth - 1]} {selectedYear}</span>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>▼</span>
                    </button>

                    {showPicker && (
                        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1px solid #dee2e6", borderRadius: 12, zIndex: 1050, width: 280, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1"
                                    onClick={() => setPickerYear(y => y - 1)}>‹</button>
                                <span style={{ fontWeight: 700, color: GREEN }}>{pickerYear}</span>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1"
                                    onClick={() => setPickerYear(y => y + 1)}
                                    disabled={pickerYear >= currentYear}>›</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                {monthShort.map((m, i) => {
                                    const monthNum = i + 1;
                                    const isSelected = monthNum === selectedMonth && pickerYear === selectedYear;
                                    const isDisabled = isFutureMonth(monthNum, pickerYear);
                                    return (
                                        <button key={m} onClick={() => handleMonthSelect(monthNum)}
                                            disabled={isDisabled}
                                            style={{ border: isSelected ? `2px solid ${GREEN}` : "1px solid #dee2e6", borderRadius: 8, padding: "8px 4px", fontSize: "0.85rem", fontWeight: isSelected ? 700 : 400, background: isSelected ? GREEN : isDisabled ? "#f8f9fa" : "#fff", color: isSelected ? "#fff" : isDisabled ? "#ced4da" : "#212529", cursor: isDisabled ? "not-allowed" : "pointer" }}
                                        >{m}</button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 12, padding: "12px 16px" }}>
                        <div style={{ fontSize: "0.78rem", color: TEAL, fontWeight: 700, textTransform: "uppercase" }}>Total (Filtered)</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: TEAL }}>Rs. {totalAmount.toFixed(2)}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 12, padding: "12px 16px" }}>
                        <div style={{ fontSize: "0.78rem", color: TEAL, fontWeight: 700, textTransform: "uppercase" }}>Entries</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: TEAL }}>{filteredExpenses.length}</div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", padding: "24px", marginBottom: "20px", border: `1px solid ${GREEN_BORDER}` }}>
                    <h6 style={{ fontWeight: 700, color: GREEN, marginBottom: "16px" }}>
                        <i className="bi bi-file-earmark-plus me-2" />
                        {editingId ? "Edit Expense" : "New Expense"}
                    </h6>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>TYPE *</label>
                            <select className="form-select form-select-sm" value={form.expenseType}
                                onChange={e => setForm({ ...form, expenseType: e.target.value })}>
                                <option value="">-- Select Type --</option>
                                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>DESCRIPTION *</label>
                            <input type="text" className="form-control form-control-sm"
                                placeholder="e.g. Bike service, June salary..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>AMOUNT (Rs.) *</label>
                            <input type="number" min={0} step="0.01" className="form-control form-control-sm"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                        </div>
                        <div className="col-md-2">
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>DATE *</label>
                            <input ref={dateInputRef} type="date" className="form-control form-control-sm"
                                value={form.expenseDate} max={today}
                                onChange={e => setForm({ ...form, expenseDate: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>NOTES (Optional)</label>
                            <input type="text" className="form-control form-control-sm"
                                placeholder="Any notes..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <button type="button" className="btn btn-sm w-100 fw-semibold"
                                style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8 }}
                                onClick={handleSave} disabled={saveLoading}>
                                {saveLoading
                                    ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</>
                                    : <><i className="bi bi-check-circle me-1" />{editingId ? "Update" : "Save"}</>}
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button type="button" className="btn btn-sm w-100 btn-outline-secondary"
                                onClick={() => { setShowForm(false); resetForm(); }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter + Search */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", padding: "16px", marginBottom: "16px" }}>
                <div className="row g-2 align-items-end">
                    <div className="col-md-2">
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Filter By Type</label>
                        <select className="form-select form-select-sm" value={filterType}
                            onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Search</label>
                        <input type="text" className="form-control form-control-sm"
                            placeholder="Search description / notes..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)} />
                    </div>
                    {(filterType || searchText) && (
                        <div className="col-md-2">
                            <button type="button" className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => { setFilterType(""); setSearchText(""); }}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                    <div className="col-md-3 ms-auto text-md-end">
                        <button type="button" className="btn btn-sm fw-semibold px-3"
                            style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px" }}
                            onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }}>
                            <i className={`bi bi-${showForm ? "x" : "plus-circle"} me-2`} />
                            {showForm ? "Cancel" : "Add Expense"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: "24px" }}>
                <div style={{ background: GREEN, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: "#fff" }}>
                        <i className="bi bi-table me-2" />Expense Records — {monthNames[selectedMonth - 1]} {selectedYear}
                    </h6>
                </div>

                {loading ? (
                    <div style={{ padding: "24px" }}><Loader /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead style={{ background: GREEN_LIGHT }}>
                                <tr>
                                    {["Type", "Description", "Amount", "Date", "Action"].map(h => (
                                        <th key={h} style={{ padding: "12px 16px", fontSize: "0.78rem", color: GREEN, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
                                            <i className="bi bi-inbox" style={{ fontSize: "2.5rem", display: "block", marginBottom: "8px", opacity: 0.4 }} />
                                            No expenses for {monthNames[selectedMonth - 1]} {selectedYear}.
                                        </td>
                                    </tr>
                                ) : filteredExpenses.map(exp => (
                                    <tr key={exp.expenseID}>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={getTypeBadgeStyle(exp.expenseType)}>
                                                {exp.expenseType}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#374151", maxWidth: "260px" }}>
                                            {exp.description}
                                            {exp.notes && exp.notes !== "string" && (
                                                <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{exp.notes}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 16px", fontWeight: 700, color: GREEN, fontSize: "0.92rem" }}>
                                            Rs. {exp.amount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#6b7280" }}>
                                            {formatDateDisplay(exp.expenseDate)}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button type="button"
                                                    style={{ fontSize: "0.78rem", borderRadius: 6, border: "none", background: "#f59e0b", color: "#fff", padding: "4px 12px", cursor: "pointer" }}
                                                    onClick={() => handleEdit(exp)}>
                                                    <i className="bi bi-pencil me-1" />Edit
                                                </button>
                                                <button type="button"
                                                    style={{ fontSize: "0.78rem", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", padding: "4px 12px", cursor: "pointer" }}
                                                    onClick={() => requestDelete(exp.expenseID)}>
                                                    <i className="bi bi-trash me-1" />Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expense;