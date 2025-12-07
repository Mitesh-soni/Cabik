import * as scootyService from "../services/scooty.services.js";

export const addScootyController = async (req, res) => {
  try {
    const result = await scootyService.addScooty(req.body);
    res.json({ success: true, scooty: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllScootiesController = async (req, res) => {
  const data = await scootyService.getAllScooties();
  res.json({ success: true, scooties: data });
};

export const getScootyByIdController = async (req, res) => {
  const scooty = await scootyService.getScootyById(req.params.id);
  if (!scooty) return res.status(404).json({ error: "Scooty not found" });
  res.json({ success: true, scooty });
};

export const getScootiesByDealerController = async (req, res) => {
  const scooties = await scootyService.getScootiesByDealer(req.params.dealerId);
  res.json({ success: true, scooties });
};
