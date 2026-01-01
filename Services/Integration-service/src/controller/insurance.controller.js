import { getInsurancePlans } from "../services/insurance.service.js";

export const fetchInsurancePlans = async (req, res) => {
  try {
    const { vehicle_type } = req.query;

    if (!vehicle_type) {
      return res.status(400).json({ message: "vehicle_type required" });
    }

    const plans = await getInsurancePlans(String(vehicle_type).toLowerCase());
    res.json({ insurance_plans: plans });
  } catch (err) {
    console.error("INSURANCE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch insurance plans" });
  }
};
