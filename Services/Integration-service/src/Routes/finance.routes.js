import express from "express";
import { getEmiOptions } from "../controller/emi.controller.js";
import { fetchInsurancePlans } from "../controller/insurance.controller.js";

const router = express.Router();

// EMI
router.post("/emi/calculate", getEmiOptions);

// Insurance
router.get("/insurance/plans", fetchInsurancePlans);

export default router;