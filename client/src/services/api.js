import axios from "axios";

const host = window.location.hostname || "localhost";
// Explicitly point to port 5000 for the backend server
const baseURL = `http://${host}:5000/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || e.message || "Something went wrong";
export default api;