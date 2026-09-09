import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create group modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [groupName, setGroupName] = useState("");

    // Join group modal
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    const [submitting, setSubmitting] = useState(false);

    const fetchGroups = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/groups/user-groups");
            setGroups(res.data || []);
        } catch (err) {
            console.error("Fetch groups error:", err);
            setError("Unable to load groups.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName || !groupName.trim()) return;
        setSubmitting(true);
        try {
            await API.post("/groups/create", { group_name: groupName.trim() });
            setShowCreateModal(false);
            setGroupName("");
            fetchGroups();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create group");
        } finally {
            setSubmitting(false);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!inviteCode || !inviteCode.trim()) return;
        setSubmitting(true);
        try {
            await API.post("/groups/join", { invite_code: inviteCode.trim() });
            setShowJoinModal(false);
            setInviteCode("");
            fetchGroups();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to join group");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Shared Expense Groups</h1>
                    <p className="text-sm text-slate-400 mt-1">Split bills, calculate balances, and manage shared group expenses.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Join by Code
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Group
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {/* GROUPS GRID */}
            {loading ? (
                <div className="py-16 text-center text-slate-500 text-sm">Loading groups...</div>
            ) : groups.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">No Groups Found</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Create a group to start splitting bills with friends or join an existing group with an invite code.
                    </p>
                    <div className="flex justify-center space-x-3 pt-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-semibold rounded-lg"
                        >
                            Create Group
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((grp) => (
                        <div key={grp.GRP_ID} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white tracking-tight">{grp.GROUP_NAME}</h3>
                                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                        Code: {grp.INVITE_CODE}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>{grp.MEMBER_COUNT || 1} Member(s)</span>
                                </div>
                            </div>

                            <Link
                                to={`/groups/${grp.GRP_ID}`}
                                className="w-full text-center py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-colors block"
                            >
                                View Group Details →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE GROUP MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Create New Group</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Group Name</label>
                                <input
                                    type="text"
                                    required
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g. Goa Trip 2026, Apartment Expenses"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Group"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN GROUP MODAL */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Join Group by Invite Code</h3>
                            <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleJoinGroup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">6-Character Invite Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. A1B2C3"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Joining..." : "Join Group"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
