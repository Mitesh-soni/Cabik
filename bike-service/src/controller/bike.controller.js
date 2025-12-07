import * as bikeService from "../services/bike.services.js";

export const addBikeController = async (req, res) => {
  try {
    const result = await bikeService.addBike(req.body);
    res.json({ success: true, bike: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllBikesController = async (req, res) => {
  const bikes = await bikeService.getAllBikes();
  res.json({ success: true, bikes });
};

export const getBikeByIdController = async (req, res) => {
  const bike = await bikeService.getBikeById(req.params.id);
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  res.json({ success: true, bike });
};

export const getBikesByDealerController = async (req, res) => {
  const bikes = await bikeService.getBikesByDealer(req.params.dealerId);
  res.json({ success: true, bikes });
};