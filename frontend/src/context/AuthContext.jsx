import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("accessToken"));
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!localStorage.getItem("accessToken")) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await API.get("/users/profile");
            setUser(res.data.user);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const login = async (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setToken(accessToken);
        await fetchProfile();
    };

    const logout = async () => {
        try {
            await API.post("/users/logout");
        } catch (err) {
            console.warn("Logout endpoint error:", err);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setToken(null);
            setUser(null);
        }
    };

    const updateUser = (updatedData) => {
        setUser((prev) => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}