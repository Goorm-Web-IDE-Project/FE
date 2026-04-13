import axios from "axios";

const api = axios.create({
  baseURL: "http://3.39.191.82:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;