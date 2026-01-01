import axios from "axios";

// Shared Axios client for all frontend API calls.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,    
  headers: {
    "Content-Type": "application/json"
  }
});

export default apiClient;
