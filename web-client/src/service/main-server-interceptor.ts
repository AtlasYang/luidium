import axios from "axios";

export const mainInstance = axios.create({
  baseURL: "https://luidium-main-api.lighterlinks.io",
  headers: {
    "Access-Control-Allow-Origin": "https://app.luidium.com",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

mainInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status == 401) {
      window.location.href = "/signin";
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
