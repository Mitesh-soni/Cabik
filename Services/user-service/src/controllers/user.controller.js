import pool from "../config/db.js";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, phone, created_at FROM users WHERE id = $1",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
