import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import { CAR_SERVICE } from "../services/service.js";

const router = express.Router();

// Add car
router.post("/add", async (req, res) => {
  const result = await forwardRequest(
    `${CAR_SERVICE}/cars/add`,
    "POST",
    req.body
  );
  res.json(result);
});

// Get all cars
router.get("/", async (req, res) => {
  const url = `${CAR_SERVICE}/cars`;
  const result = await forwardRequest(url, "GET");
  res.json(result);
});

// Filter cars
router.get("/filter", async (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  const url = `${CAR_SERVICE}/cars/filter?${params}`;
  const result = await forwardRequest(url, "GET");
  res.json(result);
});

// Get car by id
router.get("/:id", async (req, res) => {
  const url = `${CAR_SERVICE}/cars/${req.params.id}`;
  const result = await forwardRequest(url, "GET");
  res.json(result);
});

// Get cars by dealer
router.get("/dealer/:dealerId", async (req, res) => {
  const url = `${CAR_SERVICE}/cars/dealer/${req.params.dealerId}`;
  const result = await forwardRequest(url, "GET");
  res.json(result);
});

export default router;
