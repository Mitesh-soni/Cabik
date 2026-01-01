import dotenv from "dotenv";
dotenv.config();

const withDefault = (value, fallback) => value || fallback;

export const USER_SERVICE = withDefault(process.env.USER_SERVICE_URL, "http://localhost:5001");
export const DEALER_SERVICE = withDefault(process.env.DEALER_SERVICE_URL, "http://localhost:5002");
export const VEHICLE_SERVICE = withDefault(process.env.VEHICLE_SERVICE_URL, "http://localhost:5003");
export const FINANCE_URL = withDefault(process.env.FINANCE_SERVICE_URL, "http://localhost:5004");
export const ORDER_URL = withDefault(process.env.ORDER_SERVICE_URL, "http://localhost:5005");

// console.log(USER_SERVICE)
// console.log(DEALER_SERVICE)
// console.log(VEHICLE_SERVICE)