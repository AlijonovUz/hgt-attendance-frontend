import axios from "axios"

export const axiosAPI = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  paramsSerializer: {
    encode: (param) => param,
  },
});

// Auth header
axiosAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});