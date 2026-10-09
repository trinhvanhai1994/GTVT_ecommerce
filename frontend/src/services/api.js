import axios from "axios";
import { MessageConstant, NumberConstant, StringConstant, resolveUserMessage } from "../constants";

const api = axios.create({
  baseURL: "/api",
  timeout: NumberConstant.API_TIMEOUT_MS
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(StringConstant.TOKEN_KEY);
  const user = localStorage.getItem(StringConstant.USER_KEY);
  if (token && user && user !== "undefined" && user !== "null") {
    config.headers.Authorization = `${StringConstant.BEARER_PREFIX}${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data || {};
    const code = payload.code;
    const message = resolveUserMessage({
      code,
      message: payload.message || (error.message === "Network Error" ? MessageConstant.NETWORK_ERROR : error.message)
    });
    const url = String(error.config?.url || "");
    const isAuthPublic =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");
    const hadAuth = Boolean(error.config?.headers?.Authorization);
    if (status === 401 && !isAuthPublic && hadAuth) {
      localStorage.removeItem(StringConstant.TOKEN_KEY);
      localStorage.removeItem(StringConstant.USER_KEY);
      window.dispatchEvent(new Event(StringConstant.AUTH_EXPIRED_EVENT));
    }
    // `code` giữ nội bộ cho debug; UI không được render code
    return Promise.reject({ status, message, code, raw: error });
  }
);

export default api;
