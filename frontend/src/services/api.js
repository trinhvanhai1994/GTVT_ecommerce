import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user && user !== "undefined" && user !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message = payload?.message || error.message || "Network error";
    const code = payload?.code;
    const url = String(error.config?.url || "");
    const isAuthPublic =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");
    const hadAuth = Boolean(error.config?.headers?.Authorization);
    if (status === 401 && !isAuthPublic && hadAuth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject({ status, message, code, raw: error });
  }
);

export default api;
