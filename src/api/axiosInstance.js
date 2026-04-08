import axios from "axios";

// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Axios Interceptor] Bearer token attached to ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[Axios Interceptor] NO TOKEN FOUND in localStorage for ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors like 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login if unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // ONLY trigger hard reload redirect if this 401 did NOT come from the login endpoint itself
      const requestUrl = error.config?.url || "";
      if (!requestUrl.includes("/auth/login")) {
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);
