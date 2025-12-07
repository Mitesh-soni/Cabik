import express from "express";
import {
  addScootyController,
  getAllScootiesController,
  getScootyByIdController,
  getScootiesByDealerController
} from "../controllers/scooty.controller.js";

const router = express.Router();

router.post("/add", addScootyController);
router.get("/", getAllScootiesController);
router.get("/:id", getScootyByIdController);
router.get("/dealer/:dealerId", getScootiesByDealerController);

export default router;