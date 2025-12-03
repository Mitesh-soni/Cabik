import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const USER_SERVICE = process.env.USER_SERVICE_URL;

// Register
router.post("/register", async (req, res) => {
  try {
    const result = await forwardRequest(`${USER_SERVICE}/auth/register`, "POST", req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const result = await forwardRequest(`${USER_SERVICE}/auth/login`, "POST", req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status).json({ error: err.message });
  }
});

export default router;