import axios from "axios";

const API = "http://localhost:5000"; // your API Gateway

export const getCars = () => axios.get(`${API}/vehicles/cars`);
export const getBikes = () => axios.get(`${API}/vehicles/bikes`);
export const getScooties = () => axios.get(`${API}/vehicles/scooties`);