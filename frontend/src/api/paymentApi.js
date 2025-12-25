import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const payOrder = (orderId, data) => {
  return API.post(`/orders/${orderId}/pay`, data);
};
