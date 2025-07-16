import axios from "axios";

const API = axios.create({
  baseURL: "/api", // Your backend API root
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to attach JWT if stored
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
