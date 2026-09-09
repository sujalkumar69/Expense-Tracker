import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
    const [submitting, setSubmitting] = useState(false);

    // Delete modal
    const [deletingId, setDeletingId] = useState(null);

    const categories = ["All", "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchExpenses = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/expenses/all?limit=100");
            setExpenses(res.data.expenses || []);
        } catch (err) {
            console.error("Fetch expenses error:", err);
            setError("Failed to fetch expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const openAddModal = () => {
        setEditingExpense(null);
        setAmount("");
        setCategory("Food");
        setDescription("");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setShowModal(true);
    };

    const openEditModal = (exp) => {
        setEditingExpense(exp);
        setAmount(exp.AMOUNT);
        setCategory(exp.CATEGORY || "Food");
        setDescription(exp.DESCRIPTION || "");
        setExpenseDate(exp.EXPENSE_DATE || new Date().toISOString().split("T")[0]);
        setShowModal(true);
    };

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        setSubmitting(true);
        try {
            if (editingExpense) {
                await API.put(`/expenses/${editingExpense.EXPENSE_ID}`, {
                    amount: parseFloat(amount),
                    category,
                    description,
                    expense_date: expenseDate
                });
            } else {
                await API.post("/expenses/create", {
                    amount: parseFloat(amount),
                    category,
                    description,
                    expense_date: expenseDate
                });
            }
            setShowModal(false);
            fetchExpenses();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving expense");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/expenses/${id}`);
            setDeletingId(null);
            fetchExpenses();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete expense");
        }
    };

    const filteredExpenses = expenses.filter((exp) => {
        const matchesCat = selectedCategory === "All" || exp.CATEGORY === selectedCategory;
        const matchesSearch =
            (exp.DESCRIPTION || "").toLowerCase().includes(search.toLowerCase()) ||
            (exp.CATEGORY || "").toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Personal Expenses</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage, filter, and track all your individual spending records.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Expense
                </button>
            </div>

            {/* CONTROLS: SEARCH & CATEGORY FILTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <span className="text-xs text-slate-400 font-medium mr-1">Category:</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                selectedCategory === cat
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-500 text-sm">Loading expenses...</div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        <p className="text-sm">No expenses found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase text-slate-400 bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Description</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4 text-right">Amount</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp.EXPENSE_ID} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                                                {exp.CATEGORY}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-200">{exp.DESCRIPTION || "-"}</td>
                                        <td className="py-3.5 px-4 text-slate-400 text-xs">{exp.EXPENSE_DATE}</td>
                                        <td className="py-3.5 px-4 text-right font-semibold text-white">
                                            ₹{parseFloat(exp.AMOUNT).toFixed(2)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(exp)}
                                                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(exp.EXPENSE_ID)}
                                                className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {editingExpense ? "Edit Expense" : "Add New Expense"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSaveExpense} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                >
                                    {categories.filter((c) => c !== "All").map((c) => (
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
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional note"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
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

            {/* DELETE CONFIRMATION MODAL */}
            {deletingId && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white">Delete Expense?</h3>
                        <p className="text-sm text-slate-400">Are you sure you want to delete this expense record? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                className="px-4 py-2 bg-rose-500 text-white font-semibold text-sm rounded-lg hover:bg-rose-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
