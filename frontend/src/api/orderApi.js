import apiClient from "./client";

/* =========================
   CREATE ORDER
========================= */
export const createOrder = (data) => apiClient.post("/orders", data);

/* =========================
   ADD PRICE BREAKDOWN
========================= */
export const addPriceBreakup = (orderId, data) =>
  apiClient.post(`/orders/${orderId}/price`, data);

/* =========================
   ADD EMI DETAILS
========================= */
export const addEmiDetails = (orderId, data) =>
  apiClient.post(`/orders/${orderId}/emi`, data);

/* =========================
   ADD INSURANCE DETAILS
========================= */
export const addInsuranceDetails = (orderId, data) =>
  apiClient.post(`/orders/${orderId}/insurance`, data);

/* =========================
   GET ORDER BY ID
========================= */
export const getOrderById = (orderId) => apiClient.get(`/orders/${orderId}`);

/* =========================
   PAY ORDER
========================= */
export const payOrder = (orderId, data) =>
  apiClient.post(`/orders/${orderId}/pay`, data);
