import axios from "axios";

const API_BASE = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("dealer_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dealer Auth APIs
export const dealerLogin = (email, password) => {
  return axiosInstance.post("/dealers/login", { email, password });
};

export const dealerRegister = (formData) => {
  return axiosInstance.post("/dealers/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const getDealerProfile = () => {
  return axiosInstance.get("/dealers/profile");
};

export const updateDealerProfile = (data) => {
  return axiosInstance.put("/dealers/profile", data);
};

// Vehicle Management APIs
export const uploadVehicle = (vehicleData) => {
  return axiosInstance.post("/dealers/vehicles", vehicleData);
};

export const getDealerVehicles = (dealerId, filters = {}) => {
  return axiosInstance.get(`/dealers/${dealerId}/vehicles`, { params: filters });
};

export const updateVehicle = (vehicleId, data) => {
  return axiosInstance.put(`/dealers/vehicles/${vehicleId}`, data);
};

export const deleteVehicle = (vehicleId, vehicleType = 'car') => {
  return axiosInstance.delete(`/dealers/vehicles/${vehicleId}?vehicle_type=${vehicleType}`);
};

// Analytics APIs
export const getDealerAnalytics = (dealerId, timeFrame = "monthly") => {
  return axiosInstance.get(`/dealers/${dealerId}/analytics`, { 
    params: { timeFrame } 
  });
};

export const getDealerOrders = (dealerId, filters = {}) => {
  return axiosInstance.get(`/dealers/${dealerId}/orders`, { params: filters });
};

export const getDealerRevenue = (dealerId, timeFrame = "yearly") => {
  return axiosInstance.get(`/dealers/${dealerId}/revenue`, { 
    params: { timeFrame } 
  });
};

export default axiosInstance;
