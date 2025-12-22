import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/passwordHash.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {

    res.json({ success: true, message: "Order place successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};