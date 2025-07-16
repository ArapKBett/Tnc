import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api", // Use backend API URL in production, fallback to /api for dev
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every request's Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
