import * as orderService from "../services/order.service.js";

/* ============================
   CREATE ORDER (INITIATED)
============================ */
export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ============================
   ADD PRICE BREAKDOWN
============================ */
export const addPriceBreakdown = async (req, res) => {
  try {
    const data = await orderService.addPriceBreakdown(
      req.params.orderId,
      req.body
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add price breakdown" });
  }
};

/* ============================
   CONFIRM PRICE (NEW)
============================ */
export const confirmPrice = async (req, res) => {
  try {
    const order = await orderService.confirmPrice(req.params.orderId);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Price confirmation failed" });
  }
};

/* ============================
   ADD EMI DETAILS
============================ */
export const addEmiDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { bank_name, interest_rate, tenure_years, down_payment, monthly_emi, processing_fee } = req.body;

    // Validate required EMI fields
    if (!bank_name || !monthly_emi) {
      return res.status(400).json({
        message: "Bank name and monthly EMI are required"
      });
    }

    console.log(`Saving EMI for order ${orderId}:`, { bank_name, monthly_emi, tenure_years });

    const data = await orderService.addEmiDetails(orderId, req.body);
    
    console.log(`EMI saved successfully for order ${orderId}`);
    
    res.json(data);
  } catch (err) {
    console.error(`Failed to save EMI for order ${req.params.orderId}:`, err);
    res.status(500).json({ message: "Failed to add EMI details" });
  }
};

/* ============================
   ADD INSURANCE DETAILS
============================ */
export const addInsuranceDetails = async (req, res) => {
  try {
    const data = await orderService.addInsuranceDetails(
      req.params.orderId,
      req.body
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add insurance details" });
  }
};

export const payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_method } = req.body;

    if (!payment_method) {
      return res.status(400).json({
        message: "payment_method is required"
      });
    }

    // Log payment attempt for debugging
    console.log(`Payment attempt - Order: ${orderId}, Method: ${payment_method}`);

    const result = await orderService.payOrder(orderId, req.body);

    console.log(`Payment successful - Order: ${orderId}`);

    res.json({
      message: "Payment successful",
      order_id: orderId,
      payment: result
    });
  } catch (err) {
    const errorMessage = err.message || "Payment processing failed";
    console.error("Payment error for order", req.params.orderId, ":", errorMessage);
    
    // Return appropriate status based on error type
    const status = errorMessage.includes("EMI details") ? 400 : 500;
    
    res.status(status).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
    });
  }
};


/* ============================
   GET FULL ORDER
============================ */
export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};
