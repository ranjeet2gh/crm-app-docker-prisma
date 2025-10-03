
import axios from "axios";
import tokenService from "./tokenService";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// 🔍 Check if token expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// 🔄 Request interceptor
API.interceptors.request.use(async (config) => {
  // Skip token refresh for auth routes
  if (config.url.includes("/auth/login") || 
      config.url.includes("/auth/register") || 
      config.url.includes("/auth/refresh-token")) {
    return config;
  }
debugger
  let token = tokenService.getAccessToken();
  
  // If token expired, refresh it first
  if ( isTokenExpired(token)) {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    try {
      const res = await axios.post("http://localhost:3000/api/auth/refresh-token", { token: refreshToken });
      token = res.accessToken;

      // Update localStorage AND the current request
      tokenService.setAccessToken(token);
      config.headers.Authorization = `Bearer ${token}`; // ✅ attach new token
    } catch (err) {
      console.error("Refresh token failed:", err);
     // tokenService.removeTokens(); 
      throw err; // optionally redirect to login
    }
  } else {
    // Attach existing token if still valid
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

// ========================
// API calls
// ========================

export const registerUser = (data) =>
  API.post("/auth/register", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const loginUser = (data) => API.post("/auth/login", data);

export const logoutUser = (refreshToken) =>
  API.post("/auth/logout", { refreshToken });

// Admin/User APIs
export const getUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);
export const updateUserRole = (id, role) =>
  API.put(`/admin/user/${id}/role`, { role });
