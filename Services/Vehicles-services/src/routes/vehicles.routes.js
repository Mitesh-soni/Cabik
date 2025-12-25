import express from "express";
import {
  getAllVehicles,
  getVehicleById
} from "../controllers/vehicles.controller.js";

const router = express.Router();

/*
  Examples:
  GET /vehicles/car
  GET /vehicles/car?brand=Hyundai&min_price=800000
  GET /vehicles/bike?min_engine_cc=150
*/
router.get("/:type", getAllVehicles);

/*
  Examples:
  GET /vehicles/car/12
  GET /vehicles/bike/5
*/
router.get("/:type/:id", getVehicleById);

export default router;