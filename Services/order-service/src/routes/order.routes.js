import express from "express";
import {
  createOrder,
  addPriceBreakdown,
  confirmPrice,
  addEmiDetails,
  addInsuranceDetails,
  payOrder,
  getOrderById,
  getOrdersByDealer,
  getOrdersByUser
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/:orderId/price", addPriceBreakdown);
router.post("/:orderId/confirm-price", confirmPrice);
router.post("/:orderId/emi", addEmiDetails);
router.post("/:orderId/insurance", addInsuranceDetails);
router.post("/:orderId/pay", payOrder);
router.get("/:orderId", getOrderById);

// List orders for a dealer (recent first)
router.get("/dealer/:dealerId", getOrdersByDealer);

// List orders for a user (recent first)
router.get("/user/:userId", getOrdersByUser);

export default router;
