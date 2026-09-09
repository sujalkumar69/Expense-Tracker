import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function Profile() {
    const { user, updateUser, fetchProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [upiId, setUpiId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user) {
            setUsername(user.USERNAME || "");
            setUpiId(user.UPI_ID || "");
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || username.trim().length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        setLoading(true);
        try {
            await API.put("/users/profile", {
                username: username.trim(),
                upi_id: upiId.trim() || null
            });
            await fetchProfile();
            setSuccess("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">User Profile</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage your account details and payment preferences.</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
                    {success}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {!editing ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Full Name</span>
                                <div className="text-base font-semibold text-white mt-1">{user?.USERNAME || "-"}</div>
                            </div>

                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</span>
                                <div className="text-base font-semibold text-white mt-1">{user?.EMAIL || "-"}</div>
                            </div>

                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 md:col-span-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">UPI ID (for Group Settlements)</span>
                                <div className="text-base font-mono font-semibold text-emerald-400 mt-1">
                                    {user?.UPI_ID || "Not Configured"}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Configuring your UPI ID allows group members to generate payment QR codes directly to settle balances with you.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">UPI ID</label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="username@upi"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="pt-2 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-lg disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
