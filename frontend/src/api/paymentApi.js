import apiClient from "./client";

export const payOrder = (orderId, data) =>
  apiClient.post(`/orders/${orderId}/pay`, data);
