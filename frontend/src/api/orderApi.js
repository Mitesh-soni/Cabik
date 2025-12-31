import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================
   CREATE ORDER
========================= */
export const createOrder = (data) => {
  return API.post("/orders", data);
};

/* =========================
   ADD PRICE BREAKDOWN
========================= */
export const addPriceBreakup = (orderId, data) => {
  return API.post(`/orders/${orderId}/price`, data);
};

/* =========================
   ADD EMI DETAILS
========================= */
export const addEmiDetails = (orderId, data) => {
  return API.post(`/orders/${orderId}/emi`, data);
};

/* =========================
   ADD INSURANCE DETAILS
========================= */
export const addInsuranceDetails = (orderId, data) => {
  return API.post(`/orders/${orderId}/insurance`, data);
};

/* =========================
   GET ORDER BY ID
========================= */
export const getOrderById = (orderId) => {
  return API.get(`/orders/${orderId}`);
};

/* =========================
   PAY ORDER
========================= */
export const payOrder = (orderId, data) => {
  return API.post(`/orders/${orderId}/pay`, data);
};
