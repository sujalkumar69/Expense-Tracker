import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [upi_id, setUpiId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async () => {
        setError("");
        setLoading(true);
        try {
            await API.post("/users/register", {
                username,
                email,
                password,
                upi_id
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        color: "#fff",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box"
    };

    const labelStyle = {
        color: "rgba(255,255,255,0.5)",
        fontSize: "13px",
        display: "block",
        marginBottom: "8px"
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
                style={{
                    position: "fixed",
                    top: 0, left: 0,
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
                top: 0, left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.65)",
                zIndex: 1
            }} />

            {/* REGISTER CARD */}
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
                    border: "1px solid rgba(0,255,136,0.2)",
                    boxShadow: "0 0 60px rgba(0,255,136,0.05), inset 0 0 60px rgba(255,255,255,0.02)",
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
                    <div style={{ fontSize: "48px", marginBottom: "8px" }}>💰</div>
                    <h1 style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #ffd700, #00ff88)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: 0
                    }}>
                        Create Account
                    </h1>
                    <p style={{
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "8px",
                        fontSize: "14px"
                    }}>
                        Start tracking your expenses today
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

                {/* USERNAME */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your name"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                    />
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                    />
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                    />
                </div>

                {/* UPI ID */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>
                        UPI ID <span style={{ color: "#555" }}>(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={upi_id}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.border = "1px solid #ffd700"}
                        onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    />
                </div>

                {/* REGISTER BUTTON */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: "12px",
                        border: "none",
                        background: loading
                            ? "rgba(0,255,136,0.3)"
                            : "linear-gradient(90deg, #ffd700, #00ff88)",
                        color: "#000",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Creating account..." : "Create Account 🚀"}
                </motion.button>

                {/* LOGIN LINK */}
                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "14px"
                }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{
                        color: "#00ff88",
                        textDecoration: "none",
                        fontWeight: 600
                    }}>
                        Login here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}