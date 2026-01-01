import apiClient from "./client";

export const getCars = (params = {}) => apiClient.get("/vehicles/cars", { params });
export const getBikes = (params = {}) => apiClient.get("/vehicles/bikes", { params });
export const getScooties = (params = {}) => apiClient.get("/vehicles/scooties", { params });

export const getCarById = (id) => apiClient.get(`/vehicles/cars/${id}`);
export const getBikeById = (id) => apiClient.get(`/vehicles/bikes/${id}`);
export const getScootyById = (id) => apiClient.get(`/vehicles/scooties/${id}`);