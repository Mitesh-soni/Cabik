import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import { BIKE_SERVICE } from "../services/service.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const result = await forwardRequest(`${BIKE_SERVICE}/bikes/add`, "POST", req.body);
  res.json(result);
});

router.get("/", async (req, res) => {
  const result = await forwardRequest(`${BIKE_SERVICE}/bikes`, "GET");
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const result = await forwardRequest(`${BIKE_SERVICE}/bikes/${req.params.id}`, "GET");
  res.json(result);
});

router.get("/dealer/:dealerId", async (req, res) => {
  const result = await forwardRequest(
    `${BIKE_SERVICE}/bikes/dealer/${req.params.dealerId}`,
    "GET"
  );
  res.json(result);
});

export default router;