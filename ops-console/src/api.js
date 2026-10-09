import axios from "axios";

const USER_KEY = "opsUser";
const PASS_KEY = "opsPass";
const AUTH_KEY = "opsAuthed";

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === "1" && !!localStorage.getItem(USER_KEY);
}

export function getCreds() {
  return {
    username: localStorage.getItem(USER_KEY) || "",
    password: localStorage.getItem(PASS_KEY) || ""
  };
}

export function setCreds(username, password) {
  localStorage.setItem(USER_KEY, username);
  localStorage.setItem(PASS_KEY, password);
  localStorage.setItem(AUTH_KEY, "1");
}

export function clearCreds() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PASS_KEY);
  localStorage.removeItem(AUTH_KEY);
}

const api = axios.create({
  baseURL: "/api/ops",
  timeout: 30000
});

api.interceptors.request.use((config) => {
  // Do not overwrite auth passed by login() — stale localStorage used to force ops/ops and cause false 401
  if (!config.auth) {
    const { username, password } = getCreds();
    if (username && password) {
      config.auth = { username, password };
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Lỗi kết nối Ops API";
    if (status === 401 && isAuthenticated()) {
      clearCreds();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject({ status, message, raw: error });
  }
);

export async function login(username, password) {
  await api.get("/overview", { auth: { username, password } });
  setCreds(username, password);
}

export async function fetchOverview() {
  const { data } = await api.get("/overview");
  return data.data;
}

export async function fetchServices() {
  const { data } = await api.get("/services");
  return data.data;
}

export async function fetchLogs(id, tail = 200, filter = "") {
  const { data } = await api.get(`/services/${id}/logs`, { params: { tail, filter: filter || undefined } });
  return data.data.text;
}

export async function postServiceAction(id, action) {
  const { data } = await api.post(`/services/${id}/actions`, { action });
  return data.data;
}

export async function postStackAction(action) {
  const { data } = await api.post("/stack/actions", { action });
  return data.data;
}

export async function fetchJobs() {
  const { data } = await api.get("/jobs");
  return data.data;
}

export async function fetchJob(id) {
  const { data } = await api.get(`/jobs/${id}`);
  return data.data;
}

export default api;
