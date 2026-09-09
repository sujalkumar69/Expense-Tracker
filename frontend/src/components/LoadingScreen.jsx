import { motion } from "framer-motion";
import { useEffect } from "react";

export default function LoadingScreen({ onFinish }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 1500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 text-slate-100 font-sans">
            <div className="flex flex-col items-center space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </motion.div>

                <h1 className="text-xl font-bold text-white tracking-tight">ExpenseTracker</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Track. Split. Settle.</p>
            </div>
        </div>
    );
}