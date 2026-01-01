import apiClient from "./client";

export const emi = (data) => apiClient.post("/finance/emi", data);

export const insurance = (vehicle_type) =>
  apiClient.get("/finance/insurance", { params: { vehicle_type } });