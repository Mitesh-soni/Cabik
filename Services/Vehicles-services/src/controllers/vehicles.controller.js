import {
  getAllVehicles as getAllVehiclesService,
  getVehicleById as getVehicleByIdService
} from "../services/vehicles.service.js";

export const getAllVehicles = async (req, res) => {
  try {
    await getAllVehiclesService(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    await getVehicleByIdService(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
