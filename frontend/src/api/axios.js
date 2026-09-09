import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    const res = await axios.post(
                        `${API.defaults.baseURL}/users/refresh-token`,
                        { refreshToken }
                    );
                    const newAccessToken = res.data.accessToken;
                    localStorage.setItem("accessToken", newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return API(originalRequest);
                } catch (refreshErr) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                }
            } else {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;