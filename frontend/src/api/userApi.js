import apiClient from "./client";

export const registerUser = (data) => apiClient.post("/users/register", data);

export const loginUser = (data) => apiClient.post("/users/login", data);