import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import { DEALER_SERVICE } from "../services/service.js";
import { ORDER_URL } from "../services/service.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/login`, "POST", req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 401).json({ error: err.message });
    }
});

//Register with file upload
router.post("/register", upload.single("license_document"), async (req, res) => {
    try {
        const result = await forwardRequest(
            `${DEALER_SERVICE}/dealer/register`,
            "POST",
            req.body,
            {},
            req.file,
            { Authorization: req.headers.authorization }
        );
        res.json(result);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
});

// Dealer profile (requires auth)
router.get("/profile", async (req, res) => {
    try {
        const result = await forwardRequest(
            `${DEALER_SERVICE}/dealer/profile`,
            "GET",
            {},
            {},
            null,
            { Authorization: req.headers.authorization }
        );
        res.json(result);
    } catch (err) {
        res.status(err.status || 401).json({ error: err.message });
    }
});

// Fetch dealer by id
router.get("/:id", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/${req.params.id}`, "GET");
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Dealer analytics
router.get("/:dealerId/analytics", async (req, res) => {
    try {
        const result = await forwardRequest(
            `${DEALER_SERVICE}/dealer/${req.params.dealerId}/analytics`,
            "GET",
            {},
            req.query,
            null,
            { Authorization: req.headers.authorization }
        );
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Dealer revenue
router.get("/:dealerId/revenue", async (req, res) => {
    try {
        const result = await forwardRequest(
            `${DEALER_SERVICE}/dealer/${req.params.dealerId}/revenue`,
            "GET",
            {},
            req.query,
            null,
            { Authorization: req.headers.authorization }
        );
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Dealer orders (recent first)
router.get("/:dealerId/orders", async (req, res) => {
    try {
        const result = await forwardRequest(
            `${DEALER_SERVICE}/dealer/${req.params.dealerId}/orders`,
            "GET",
            {},
            req.query,
            null,
            { Authorization: req.headers.authorization }
        );
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Upload vehicle
router.post("/vehicles", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/vehicles`, "POST", req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Get dealer vehicles
router.get("/:dealerId/vehicles", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/${req.params.dealerId}/vehicles`, "GET");
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Update vehicle
router.put("/vehicles/:vehicleId", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/vehicles/${req.params.vehicleId}`, "PUT", req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// Delete vehicle
router.delete("/vehicles/:vehicleId", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/vehicles/${req.params.vehicleId}`, "DELETE");
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

export default router;