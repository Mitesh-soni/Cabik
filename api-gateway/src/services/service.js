import dotenv from "dotenv";
dotenv.config();

export const USER_SERVICE = process.env.USER_SERVICE_URL;
export const DEALER_SERVICE = process.env.DEALER_SERVICE_URL;
export const VEHICLE_SERVICE = process.env.VEHICLE_SERVICE_URL;

// console.log(USER_SERVICE)
// console.log(DEALER_SERVICE)
// console.log(VEHICLE_SERVICE)