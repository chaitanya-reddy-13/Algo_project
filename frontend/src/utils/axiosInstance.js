// frontend/src/utils/axiosInstance.js
import axios from "axios";

// Directly set the base URL since you are not using .env
const instance = axios.create({
  baseURL: "http://65.0.127.55/api/", // Include /api/ if your backend uses it
});

instance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = localStorage.getItem("refresh");

    if (
      error.response?.status === 401 &&
      refresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await instance.post("token/refresh/", { refresh });
        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return instance(originalRequest);
      } catch (err) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
