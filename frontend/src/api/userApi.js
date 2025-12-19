import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // API Gateway
});

// REGISTER USER
export const registerUser = (data) =>
  API.post("/users/register", data);

// LOGIN USER
export const loginUser = (data) =>
  API.post("/users/login", data);