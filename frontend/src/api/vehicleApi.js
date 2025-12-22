import axios from "axios";

const API = "http://localhost:5000"; // your API Gateway

export const getCars = () => axios.get(`${API}/vehicles/cars`);
console.log(getCars)
export const getBikes = () => axios.get(`${API}/vehicles/bikes`);
console.log(getBikes);
export const getScooties = () => axios.get(`${API}/vehicles/scooties`);
console.log(getScooties);

export const getCarById = (id) => axios.get(`${API}/vehicles/cars/${id}`);
export const getBikeById = (id) => axios.get(`${API}/vehicles/bikes/${id}`);
export const getScootyById = (id) => axios.get(`${API}/vehicles/scooties/${id}`);