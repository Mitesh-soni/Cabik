import express from "express";
import axios from "axios";
import { ORDER_URL } from "../services/service.js";

const router = express.Router();

/* ================================
   CREATE ORDER (INITIATED)
================================ */
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders`,
      req.body
    );
    res.status(201).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Order creation failed" }
    );
  }
});

/* ================================
   ADD PRICE BREAKDOWN
================================ */
router.post("/:orderId/price", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders/${req.params.orderId}/price`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Price breakup failed" }
    );
  }
});

/* ================================
   CONFIRM PRICE (NEW)
================================ */
router.post("/:orderId/confirm-price", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders/${req.params.orderId}/confirm-price`
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Price confirmation failed" }
    );
  }
});

/* ================================
   ADD EMI DETAILS
================================ */
router.post("/:orderId/emi", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders/${req.params.orderId}/emi`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "EMI save failed" }
    );
  }
});

/* ================================
   ADD INSURANCE DETAILS
================================ */
router.post("/:orderId/insurance", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders/${req.params.orderId}/insurance`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Insurance save failed" }
    );
  }
});

/* PAY ORDER */
router.post("/:orderId/pay", async (req, res) => {
  try {
    const response = await axios.post(
      `${ORDER_URL}/orders/${req.params.orderId}/pay`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Payment failed" }
    );
  }
});


/* ================================
   GET ORDER BY ID
================================ */
router.get("/:orderId", async (req, res) => {
  try {
    const response = await axios.get(
      `${ORDER_URL}/orders/${req.params.orderId}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Order not found" }
    );
  }
});

export default router;
