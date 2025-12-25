import express from "express";
import {
  createOrder,
  addPriceBreakdown,
  confirmPrice,
  addEmiDetails,
  addInsuranceDetails,
  payOrder,
  getOrderById
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/:orderId/price", addPriceBreakdown);
router.post("/:orderId/confirm-price", confirmPrice);
router.post("/:orderId/emi", addEmiDetails);
router.post("/:orderId/insurance", addInsuranceDetails);
router.post("/:orderId/pay", payOrder);
router.get("/:orderId", getOrderById);

export default router;
