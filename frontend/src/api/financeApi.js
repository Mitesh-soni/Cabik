import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

/* EMI */
export const emi = (data) => {
  return API.post("/finance/emi", data);
};

/* INSURANCE */
export const insurance = (vehicle_type) => {
  return API.get("/finance/insurance", {
    params: { vehicle_type },
  });}