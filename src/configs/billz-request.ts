import axios from "axios";
import { toast } from "react-toastify";

const BILLZ_API = "https://api-admin.billz.ai";

const billzRequest = axios.create({
  baseURL: BILLZ_API,
});

billzRequest.interceptors.request.use((config) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfcGxhdGZvcm1faWQiOiI3ZDRhNGMzOC1kZDg0LTQ5MDItYjc0NC0wNDg4YjgwYTRjMDEiLCJjb21wYW55X2lkIjoiMDIwYTZiZWItNmYyNi00ODFjLWIwMTUtZjJhYWQ2NDVmYWMyIiwiZGF0YSI6IiIsImV4cCI6MTc1OTg1MTAwNSwiaWF0IjoxNzU3MjU5MDA1LCJpZCI6IjYxOTgxYzFiLTE2NWItNDU2Ni1iMGRkLTZiYjU0Y2Y0YmE2MSIsInVzZXJfaWQiOiI1N2EzNDJlNC05ZjE3LTQzNGItODY4NS0yZDA0YjA1MzIxMTUifQ.H0AkzxaxJUsCHJE4blnjhaqTlkRPkDa8PmlxyV1m9P0";

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
