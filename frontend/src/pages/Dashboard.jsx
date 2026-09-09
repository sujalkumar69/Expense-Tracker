import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function Dashboard() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
    const [submitting, setSubmitting] = useState(false);

    const categories = ["Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [expRes, grpRes] = await Promise.all([
                API.get("/expenses/all?limit=50"),
                API.get("/groups/user-groups")
            ]);
            setExpenses(expRes.data.expenses || []);
            setGroups(grpRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Unable to load dashboard data. Please check your backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        setSubmitting(true);
        try {
            await API.post("/expenses/create", {
                amount: parseFloat(amount),
                category,
                description,
                expense_date: expenseDate
            });
            setShowQuickAddModal(false);
            setAmount("");
            setDescription("");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add expense");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate Financial Metrics
    const totalSpent = expenses.reduce((acc, curr) => acc + (parseFloat(curr.AMOUNT) || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthSpent = expenses.reduce((acc, curr) => {
        if (!curr.EXPENSE_DATE) return acc;
        const d = new Date(curr.EXPENSE_DATE);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            return acc + (parseFloat(curr.AMOUNT) || 0);
        }
        return acc;
    }, 0);

    // Group expenses by category
    const categoryTotals = expenses.reduce((acc, curr) => {
        const cat = curr.CATEGORY || "Other";
        acc[cat] = (acc[cat] || 0) + (parseFloat(curr.AMOUNT) || 0);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {/* WELCOME HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Welcome back, {user?.USERNAME || "User"}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Here is your personal financial summary and group status overview.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowQuickAddModal(true)}
                        className="inline-flex items-center px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Quick Add Expense
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm flex items-center space-x-3">
                    <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* METRICS CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-white">
                        ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Across all recorded personal transactions</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">This Month</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-white">
                        ₹{thisMonthSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Spent in current calendar month</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Groups</span>
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-white">
                        {groups.length}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Shared expense groups</p>
                </div>
            </div>

            {/* LOWER CONTENT GRID: RECENT TRANSACTIONS & CATEGORY BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT TRANSACTIONS TABLE */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                        <Link to="/expenses" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-slate-500 text-sm">Loading transactions...</div>
                    ) : expenses.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            <p className="text-sm">No expenses recorded yet.</p>
                            <button
                                onClick={() => setShowQuickAddModal(true)}
                                className="mt-3 text-xs text-emerald-400 hover:underline font-medium"
                            >
                                Add your first expense
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-2">Category</th>
                                        <th className="py-3 px-2">Description</th>
                                        <th className="py-3 px-2">Date</th>
                                        <th className="py-3 px-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {expenses.slice(0, 5).map((exp) => (
                                        <tr key={exp.EXPENSE_ID} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                                                    {exp.CATEGORY}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-slate-200">{exp.DESCRIPTION || "-"}</td>
                                            <td className="py-3 px-2 text-slate-400 text-xs">{exp.EXPENSE_DATE}</td>
                                            <td className="py-3 px-2 text-right font-semibold text-white">
                                                ₹{parseFloat(exp.AMOUNT).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* CATEGORY BREAKDOWN */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-bold text-white">Category Breakdown</h2>

                    {Object.keys(categoryTotals).length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No category metrics available yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(categoryTotals).map(([cat, amt]) => {
                                const percentage = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
                                return (
                                    <div key={cat} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-medium text-slate-300">
                                            <span>{cat}</span>
                                            <span>₹{amt.toFixed(2)} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* QUICK ADD MODAL */}
            {showQuickAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Quick Add Expense</h3>
                            <button
                                onClick={() => setShowQuickAddModal(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional note"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickAddModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Save Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}