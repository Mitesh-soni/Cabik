import express from "express";
import axios from "axios";
import { FINANCE_URL } from "../services/service.js";

const router = express.Router();

// Avoid client caching so responses always include data
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const sendError = (res, err, fallbackMessage) => {
  const status = err.response?.status || 500;
  const message = err.response?.data?.error || err.response?.data?.message || fallbackMessage;
  res.status(status).json({ error: message });
};

/* ================= EMI ================= */
router.post("/emi", async (req, res) => {
  try {
    const response = await axios.post(
      `${FINANCE_URL}/finance/emi/calculate`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error("EMI GATEWAY ERROR:", err.message);
    sendError(res, err, "EMI service failed");
  }
});

/* ================= INSURANCE ================= */
router.get("/insurance", async (req, res) => {
  try {
    const response = await axios.get(
      `${FINANCE_URL}/finance/insurance/plans`,
      { params: req.query }
    );
    res.json(response.data);
  } catch (err) {
    console.error("INSURANCE GATEWAY ERROR:", err.message);
    sendError(res, err, "Insurance service failed");
  }
});

export default router;
