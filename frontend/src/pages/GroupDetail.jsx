import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function GroupDetail() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [settlementData, setSettlementData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add expense modal
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // UPI QR modal
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState("");

    // Copy invite code toast feedback
    const [copied, setCopied] = useState(false);

    const fetchGroupData = async () => {
        setLoading(true);
        setError("");
        try {
            const [expRes, memRes, setRes] = await Promise.all([
                API.get(`/groups/expense/${groupId}`),
                API.get(`/groups/members/${groupId}`),
                API.get(`/groups/settle/${groupId}`)
            ]);
            setExpenses(Array.isArray(expRes.data) ? expRes.data : expRes.data.expenses || []);
            setMembers(memRes.data || []);
            setSettlementData(setRes.data || null);
        } catch (err) {
            console.error("Group detail fetch error:", err);
            setError(err.response?.data?.message || "Failed to load group details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        setSubmitting(true);
        try {
            await API.post("/groups/expense", {
                group_id: parseInt(groupId),
                amount: parseFloat(amount),
                description
            });
            setShowAddExpenseModal(false);
            setAmount("");
            setDescription("");
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add group expense");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateQr = async (targetUserId) => {
        setShowQrModal(true);
        setQrLoading(true);
        setQrError("");
        setQrData(null);
        try {
            const res = await API.get(`/groups/generate-qr/${groupId}/${targetUserId}`);
            setQrData(res.data);
        } catch (err) {
            setQrError(err.response?.data?.message || "Failed to generate UPI QR code.");
        } finally {
            setQrLoading(false);
        }
    };

    const handleMarkSettled = async (targetUserId) => {
        try {
            await API.put(`/groups/settle-member/${groupId}/${targetUserId}`);
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark member as settled");
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await API.delete(`/groups/leave/${groupId}`);
            navigate("/groups");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to leave group");
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to delete this group permanently? All member logs and expenses will be lost.")) return;
        try {
            await API.delete(`/groups/delete/${groupId}`);
            navigate("/groups");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete group");
        }
    };

    return (
        <div className="space-y-8">
            {/* BACK BUTTON & HEADER */}
            <div className="space-y-4">
                <Link to="/groups" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    ← Back to Groups
                </Link>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Group #{groupId} Details</h1>
                        <p className="text-xs text-slate-400 mt-1">Review shared expenses, member balances, and UPI settlements.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowAddExpenseModal(true)}
                            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-sm"
                        >
                            Add Group Expense
                        </button>
                        <button
                            onClick={handleLeaveGroup}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700"
                        >
                            Leave Group
                        </button>
                        <button
                            onClick={handleDeleteGroup}
                            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded-xl border border-rose-500/20"
                        >
                            Delete Group
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {/* SETTLEMENT & MEMBER BALANCES SUMMARY */}
            {settlementData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Group Spend</span>
                        <div className="mt-2 text-2xl font-extrabold text-white">₹{settlementData.totalExpense}</div>
                        <p className="text-xs text-slate-500 mt-1">Combined expenses paid by all members</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Per Person Share</span>
                        <div className="mt-2 text-2xl font-extrabold text-white">₹{settlementData.perPerson}</div>
                        <p className="text-xs text-slate-500 mt-1">Equal split cost per group member</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Members</span>
                        <div className="mt-2 text-2xl font-extrabold text-white">{members.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Active participants in this group</p>
                    </div>
                </div>
            )}

            {/* SETTLEMENT BALANCES TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">Member Balances & Settlements</h2>

                {settlementData?.settlement?.length === 0 ? (
                    <p className="text-xs text-slate-500">No member settlement data available.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="py-3 px-2">Member</th>
                                    <th className="py-3 px-2">Amount Paid</th>
                                    <th className="py-3 px-2">Should Pay</th>
                                    <th className="py-3 px-2">Net Balance</th>
                                    <th className="py-3 px-2 text-center">Status / Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {settlementData?.settlement?.map((st) => {
                                    const owesMoney = st.balance < 0;
                                    const getsMoney = st.balance > 0;
                                    return (
                                        <tr key={st.user_id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-2 font-medium text-slate-200">
                                                {st.username || `User #${st.user_id}`}
                                                {st.user_id === user?.USER_ID && <span className="text-xs text-emerald-400 ml-2">(You)</span>}
                                            </td>
                                            <td className="py-3 px-2">₹{st.paid}</td>
                                            <td className="py-3 px-2">₹{st.should_pay}</td>
                                            <td className="py-3 px-2 font-semibold">
                                                {owesMoney ? (
                                                    <span className="text-rose-400">Owes ₹{Math.abs(st.balance).toFixed(2)}</span>
                                                ) : getsMoney ? (
                                                    <span className="text-emerald-400">Gets ₹{st.balance.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-slate-400">Settled (₹0.00)</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-center space-x-2">
                                                {st.settled === 1 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Settled
                                                    </span>
                                                ) : owesMoney ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleGenerateQr(st.user_id)}
                                                            className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-md"
                                                        >
                                                            Generate UPI QR
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarkSettled(st.user_id)}
                                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md border border-slate-700"
                                                        >
                                                            Mark Settled
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500">-</span>
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

            {/* EXPENSES LOG */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">Group Expense Log</h2>

                {expenses.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No group expenses recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="py-3 px-2">Paid By</th>
                                    <th className="py-3 px-2">Description</th>
                                    <th className="py-3 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {expenses.map((exp) => (
                                    <tr key={exp.GROUP_EXPENSE_ID} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-2 font-medium text-slate-200">
                                            {exp.PAID_BY_NAME || `User #${exp.PAID_BY}`}
                                        </td>
                                        <td className="py-3 px-2 text-slate-300">{exp.DESCRIPTION || "-"}</td>
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

            {/* ADD GROUP EXPENSE MODAL */}
            {showAddExpenseModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Group Expense</h3>
                            <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">
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
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Dinner bill, Hotel booking"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddExpenseModal(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Adding..." : "Add Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* UPI QR MODAL */}
            {showQrModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl text-center">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">UPI Payment QR</h3>
                            <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {qrLoading ? (
                            <div className="py-12 text-slate-400 text-sm">Generating UPI QR code...</div>
                        ) : qrError ? (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
                                {qrError}
                            </div>
                        ) : qrData ? (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
                                    <img src={qrData.qr} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-bold text-emerald-400">₹{qrData.amount_owed}</div>
                                    <div className="text-xs text-slate-300">Payee: <span className="font-semibold text-white">{qrData.admin_name}</span> ({qrData.admin_upi})</div>
                                </div>

                                {/* EXPLICIT PAYMENT DISCLAIMER AS REQUIRED BY GUIDELINES */}
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        <strong className="text-slate-300">Payment Disclaimer:</strong> This QR code is generated for payment convenience via standard UPI apps (GPay, PhonePe, Paytm). ExpenseTracker does not process or verify bank transactions automatically. Members must manually confirm settlement once completed.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        <button
                            onClick={() => setShowQrModal(false)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
