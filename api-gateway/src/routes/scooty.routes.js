import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import { SCOOTY_SERVICE } from "../services/service.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const result = await forwardRequest(`${SCOOTY_SERVICE}/scooties/add`, "POST", req.body);
  res.json(result);
});

router.get("/", async (req, res) => {
  const result = await forwardRequest(`${SCOOTY_SERVICE}/scooties`, "GET");
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const result = await forwardRequest(`${SCOOTY_SERVICE}/scooties/${req.params.id}`, "GET");
  res.json(result);
});

router.get("/dealer/:dealerId", async (req, res) => {
  const result = await forwardRequest(
    `${SCOOTY_SERVICE}/scooties/dealer/${req.params.dealerId}`,
    "GET"
  );
  res.json(result);
});

export default router;
