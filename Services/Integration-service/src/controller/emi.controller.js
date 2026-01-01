import { calculateEmiOptions } from "../services/emi.service.js";

export const getEmiOptions = async (req, res) => {
  try {
    const {
      vehicle_type,
      vehicle_price,
      down_payment = 0,
      tenure_years
    } = req.body;

    if (!vehicle_type || vehicle_price === undefined || tenure_years === undefined) {
      return res.status(400).json({ message: "vehicle_type, vehicle_price and tenure_years are required" });
    }

    const vehiclePriceNum = Number(vehicle_price);
    const downPaymentNum = Number(down_payment);
    const tenureYearsNum = Number(tenure_years);

    if (!Number.isFinite(vehiclePriceNum) || vehiclePriceNum <= 0) {
      return res.status(400).json({ message: "vehicle_price must be a positive number" });
    }
    if (!Number.isFinite(downPaymentNum) || downPaymentNum < 0) {
      return res.status(400).json({ message: "down_payment must be a non-negative number" });
    }
    if (!Number.isFinite(tenureYearsNum) || tenureYearsNum <= 0) {
      return res.status(400).json({ message: "tenure_years must be a positive number" });
    }

    const emiOptions = await calculateEmiOptions({
      vehicle_type: String(vehicle_type).toLowerCase(),
      vehicle_price: vehiclePriceNum,
      down_payment: downPaymentNum,
      tenure_years: tenureYearsNum
    });

    res.json({ emi_options: emiOptions });
  } catch (err) {
    console.error("EMI ERROR:", err);
    res.status(500).json({ message: "Failed to calculate EMI" });
  }
};
