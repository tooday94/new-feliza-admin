import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
const BILLZ_API = "https://api-admin.billz.ai";

const billzRequest = axios.create({
  baseURL: BILLZ_API,
});

billzRequest.interceptors.request.use((config) => {
  const token = Cookies.get("BILLZ-TOKEN");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  console.log("Sending request BILLZ:", config);
  return config;
});

billzRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || 403) {
      //   Cookies.remove("FELIZA-TOKEN");
      toast.error("Billz Sessiya tugagan, qaytadan login qiling!");
      //   window.history.pushState(null, "", "/");
    }
    console.error("Error request:", error);
    return Promise.reject(error);
  }
);

export default billzRequest;
