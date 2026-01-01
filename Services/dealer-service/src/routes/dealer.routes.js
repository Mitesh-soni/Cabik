import express from "express";
import { 
  loginDealer, 
  registerDealer, 
  getDealer,
  getDealerProfile,
  getDealerAnalytics,
  getDealerRevenue,
  getDealerOrders,
  uploadVehicle,
  getDealerVehicles,
  updateVehicle,
  deleteVehicle
} from "../controllers/dealer.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginDealer);
router.post("/register", upload.single("license_document"), registerDealer);
router.get("/profile", getDealerProfile);
router.get("/:id", getDealer);
router.get("/:dealerId/analytics", getDealerAnalytics);
router.get("/:dealerId/revenue", getDealerRevenue);
router.get("/:dealerId/orders", getDealerOrders);

// Vehicle management routes
router.post("/vehicles", uploadVehicle);
router.get("/:dealerId/vehicles", getDealerVehicles);
router.put("/vehicles/:vehicleId", updateVehicle);
router.delete("/vehicles/:vehicleId", deleteVehicle);

export default router;