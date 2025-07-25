import axios from "axios";

const instance = axios.create({
  baseURL: "https://65.0.127.55/api/",
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post("https://65.0.127.55/api/token/refresh/", {
          refresh: localStorage.getItem("refresh_token"),
        });

        localStorage.setItem("access_token", res.data.access);

        instance.defaults.headers.common["Authorization"] =
          "Bearer " + res.data.access;
        originalRequest.headers["Authorization"] =
          "Bearer " + res.data.access;

        return instance(originalRequest);
      } catch (err) {
        console.error("Refresh failed:", err);
        window.location.href = "/login"; // redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
