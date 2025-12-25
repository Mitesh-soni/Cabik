import { calculateEmiOptions } from "../services/emi.service.js";

export const getEmiOptions = async (req, res) => {
  try {
    const {
      vehicle_type,
      vehicle_price,
      down_payment = 0,
      tenure_years
    } = req.body;

    if (!vehicle_type || !vehicle_price || !tenure_years) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emiOptions = await calculateEmiOptions({
      vehicle_type,
      vehicle_price,
      down_payment,
      tenure_years
    });

    res.json({ emi_options: emiOptions });
  } catch (err) {
    console.error("EMI ERROR:", err);
    res.status(500).json({ message: "Failed to calculate EMI" });
  }
};
