import express from "express";
import {
  addBikeController,
  getAllBikesController,
  getBikeByIdController,
  getBikesByDealerController
} from "../controller/bike.controller.js";

const router = express.Router();

router.post("/add", addBikeController);
router.get("/", getAllBikesController);
router.get("/:id", getBikeByIdController);
router.get("/dealer/:dealerId", getBikesByDealerController);

export default router;