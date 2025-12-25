import express from "express";
import axios from "axios";
import { FINANCE_URL } from "../services/service.js";

const router = express.Router();

/* ================= EMI ================= */
router.post("/emi", async (req, res) => {
  try {
    const response = await axios.post(
      `${FINANCE_URL}/finance/emi/calculate`,
      req.body
    );

    // 🔥 IMPORTANT: return response
    res.json(response.data);
  } catch (err) {
    console.error("EMI GATEWAY ERROR:", err.message);
    res.status(500).json({ error: "EMI service failed" });
  }
});

/* ================= INSURANCE ================= */
router.get("/insurance", async (req, res) => {
  try {
    const response = await axios.get(
      `${FINANCE_URL}/finance/insurance/plans`,
      { params: req.query } // 🔥 forward vehicle_type
    );

    res.json(response.data);
  } catch (err) {
    console.error("INSURANCE GATEWAY ERROR:", err.message);
    res.status(500).json({ error: "Insurance service failed" });
  }
});

export default router;
