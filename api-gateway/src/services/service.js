import dotenv from "dotenv";
dotenv.config();

export const USER_SERVICE = process.env.USER_SERVICE_URL;
export const DEALER_SERVICE = process.env.DEALER_SERVICE_URL;
export const CAR_SERVICE = process.env.CAR_SERVICE_URL;
export const BIKE_SERVICE = process.env.BIKE_SERVICE_URL;
export const SCOOTY_SERVICE = process.env.SCOOTY_SERVICE_URL;

// console.log(USER_SERVICE)
// console.log(DEALER_SERVICE)
// console.log(CAR_SERVICE)
// console.log(BIKE_SERVICE)
// console.log(SCOOTY_SERVICE)