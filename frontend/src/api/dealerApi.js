import apiClient from "./client";

export const getDealerById = (id) => apiClient.get(`/dealer/${id}`);
