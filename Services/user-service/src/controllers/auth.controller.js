import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/passwordHash.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await pool.query("SELECT 1 FROM users WHERE email=$1", [
      normalizedEmail,
    ]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const password_hash = hashPassword(password);

    await pool.query(
      "INSERT INTO users(full_name, email, phone, password_hash) VALUES($1,$2,$3,$4)",
      [full_name, normalizedEmail, phone, password_hash]
    );

    res.status(201).json({ success: true, message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash FROM users WHERE email=$1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const valid = comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.full_name
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};