import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await API.post("/users/login", { email, password });
            login(res.data.accessToken, res.data.refreshToken);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Segoe UI', sans-serif",
            overflow: "hidden"
        }}>

            {/* VIDEO BACKGROUND */}
            <video
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() =>console.log("Video loaded")}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0
                }}
            >
                <source src="/money-bd.mp4/video.mp4" type="video/mp4" />
            </video>

            {/* DARK OVERLAY */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.6)",
                zIndex: 1
            }} />

            {/* LOGIN CARD */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    margin: "20px",
                    padding: "40px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    boxShadow: "0 0 60px rgba(255,107,53,0.1), inset 0 0 60px rgba(255,255,255,0.02)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: 10,
                    position: "relative"
                }}
            >
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: "center", marginBottom: "32px" }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "8px" }}>🤑</div>
                    <h1 style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #ffd700, #ff6b35)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: 0
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "8px",
                        fontSize: "14px"
                    }}>
                        Sign in to track your expenses
                    </p>
                </motion.div>

                {/* ERROR */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "rgba(255,50,50,0.1)",
                            border: "1px solid rgba(255,50,50,0.3)",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginBottom: "20px"
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {/* EMAIL INPUT */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        display: "block",
                        marginBottom: "8px"
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                    />
                </div>

                {/* PASSWORD INPUT */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        display: "block",
                        marginBottom: "8px"
                    }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                </div>

                {/* LOGIN BUTTON */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: "12px",
                        border: "none",
                        background: loading
                            ? "rgba(255,107,53,0.4)"
                            : "linear-gradient(90deg, #ffd700, #ff6b35)",
                        color: "#000",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Signing in..." : "Sign In 🚀"}
                </motion.button>

                {/* REGISTER LINK */}
                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "14px"
                }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{
                        color: "#ff6b35",
                        textDecoration: "none",
                        fontWeight: 600
                    }}>
                        Register here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}