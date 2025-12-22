// routes/emi.routes.js
import express from "express";
import { getEmiBanks } from "../controllers/emi.controller.js";

const router = express.Router();

router.get("/banks", getEmiBanks);

export default router;