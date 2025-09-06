import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const FELIZA_API = "https://felizabackend.uz";

const request = axios.create({
  baseURL: FELIZA_API,
});

request.interceptors.request.use((config) => {
  const token = Cookies.get("FELIZA-TOKEN");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  console.log("Sending request:", config);
  return config;
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || 403) {
      Cookies.remove("FELIZA-TOKEN");
      toast.error("Sessiya tugagan, qaytadan login qiling!");
      window.history.pushState(null, "", "/");
    }
    console.error("Error request:", error);
    return Promise.reject(error);
  }
);

export default request;
