import * as carService from "../services/car.services.js";

export const addCarController = async (req, res) => {
  try {
    const result = await carService.addCar(req.body);
    res.json({ success: true, car: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllCarsController = async (req, res) => {
  try {
    const cars = await carService.getAllCars();
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCarByIdController = async (req, res) => {
  try {
    const car = await carService.getCarById(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCarsByDealerController = async (req, res) => {
  try {
    const cars = await carService.getCarsByDealer(req.params.dealerId);
    res.json({ success: true, cars });
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const filterCarsController = async (req, res) => {
  try {
    const cars = await carService.filterCars(req.query);
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};