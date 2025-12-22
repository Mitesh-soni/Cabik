// controllers/emi.controller.js
import { pool } from "../db.js";

export const getEmiBanks = async (req, res) => {
  try {
    const { vehicle_type, tenure } = req.query;

    if (!vehicle_type) {
      return res.status(400).json({ message: "vehicle_type required" });
    }

    const query = `
      SELECT 
        b.id AS bank_id,
        b.bank_name,
        r.min_interest_rate,
        r.max_interest_rate,
        r.min_tenure_years,
        r.max_tenure_years,
        r.processing_fee
      FROM emi_banks b
      JOIN emi_bank_rates r ON b.id = r.bank_id
      WHERE r.vehicle_type = $1
      AND ($2::int IS NULL 
           OR $2 BETWEEN r.min_tenure_years AND r.max_tenure_years)
      AND b.is_active = true
      ORDER BY r.min_interest_rate ASC
    `;

    const { rows } = await pool.query(query, [
      vehicle_type,
      tenure || null
    ]);

    res.json({ banks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "EMI service error" });
  }
};
