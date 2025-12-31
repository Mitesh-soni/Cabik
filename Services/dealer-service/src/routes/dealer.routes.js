import express from "express";
import { registerDealer, getDealer } from "../controllers/dealer.controller.js";

const router = express.Router();

router.post("/register", registerDealer);
router.get("/:id", getDealer);

export default router;