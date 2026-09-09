import { motion } from "framer-motion";
import { useEffect } from "react";

export default function LoadingScreen({ onFinish }) {

    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}>

            {/* BACKGROUND GLOW */}
            <div style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #ff6b3520, #ffd70010)",
                filter: "blur(80px)",
                pointerEvents: "none"
            }} />

            {/* FLYING MONEY */}
            {["💵", "💴", "💶", "💷", "🪙"].map((money, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: "absolute",
                        fontSize: "28px",
                        zIndex: 5
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                        x: [0, (i % 2 === 0 ? 1 : -1) * (100 + i * 40)],
                        y: [0, -(80 + i * 25)],
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.3, 1, 0],
                        rotate: [0, i % 2 === 0 ? 45 : -45]
                    }}
                    transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeOut"
                    }}
                >
                    {money}
                </motion.div>
            ))}

            {/* MAIN CONTENT */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 10
            }}>

                {/* EMOJI FIGURE */}
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [-3, 3, -3]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ fontSize: "120px", lineHeight: 1 }}
                >
                    🤑
                </motion.div>

                {/* APP NAME */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        fontSize: "42px",
                        fontWeight: 900,
                        marginTop: "16px",
                        background: "linear-gradient(90deg, #ffd700, #ff6b35)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-1px"
                    }}
                >
                    Expense Tracker
                </motion.h1>

                {/* TAGLINE */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        color: "#888",
                        marginTop: "8px",
                        fontSize: "14px",
                        letterSpacing: "4px",
                        textTransform: "uppercase"
                    }}
                >
                    Track. Split. Settle.
                </motion.p>

                {/* LOADING BAR CONTAINER */}
                <div style={{
                    marginTop: "32px",
                    width: "250px",
                    height: "4px",
                    background: "#1a1a1a",
                    borderRadius: "999px",
                    overflow: "hidden"
                }}>
                    <motion.div
                        style={{
                            height: "100%",
                            background: "linear-gradient(90deg, #ffd700, #ff6b35)",
                            borderRadius: "999px"
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.2, ease: "linear" }}
                    />
                </div>

                {/* LOADING TEXT */}
                <motion.p
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                        color: "#ff6b35",
                        marginTop: "12px",
                        fontSize: "13px"
                    }}
                >
                    Loading your finances...
                </motion.p>
            </div>
        </div>
    );
}