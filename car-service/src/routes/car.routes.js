import express from "express";
import {
  addCarController,
  getAllCarsController,
  getCarByIdController,
  getCarsByDealerController,
  filterCarsController,
} from "../controller/car.controller.js";

const router = express.Router();

router.post("/add", addCarController);
router.get("/", getAllCarsController);
router.get("/filter", filterCarsController);
router.get("/:id", getCarByIdController);
router.get("/dealer/:dealerId", getCarsByDealerController);

export default router;