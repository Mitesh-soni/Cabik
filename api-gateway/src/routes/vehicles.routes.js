import express from "express";
import axios from "axios";

const router = express.Router();

import { VEHICLE_SERVICE } from "../services/service.js";

/* ======================
   CARS
====================== */
router.get("/cars", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/car`, { params: req.query })
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

router.get("/cars/:id", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/car/${req.params.id}`)
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

/* ======================
   BIKES
====================== */
router.get("/bikes", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/bike`, { params: req.query })
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

router.get("/bikes/:id", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/bike/${req.params.id}`)
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

/* ======================
   SCOOTIES
====================== */
router.get("/scooties", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/scooty`, { params: req.query })
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

router.get("/scooties/:id", (req, res) => {
  axios
    .get(`${VEHICLE_SERVICE}/vehicles/scooty/${req.params.id}`)
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json(e.response?.data));
});

export default router;
