import { pool } from "../db/db.js";

/* ============================
   CREATE ORDER (INITIATED)
============================ */
export const createOrder = async ({
  user_id,
  dealer_id,
  vehicle_type,
  vehicle_id,
  base_price
}) => {
  const { rows } = await pool.query(
    `
    INSERT INTO orders
    (user_id, dealer_id, vehicle_type, vehicle_id, base_price, order_status)
    VALUES ($1,$2,$3,$4,$5,'INITIATED')
    RETURNING *
    `,
    [user_id, dealer_id, vehicle_type, vehicle_id, base_price]
  );

  return rows[0];
};

/* ============================
   PRICE BREAKDOWN
============================ */
export const addPriceBreakdown = async (orderId, data) => {
  const {
    ex_showroom_price = 0,
    gst_amount = 0,
    insurance_amount = 0,
    rto_amount = 0,
    accessories_amount = 0,
    discount_amount = 0
  } = data;

  const total_amount =
    Number(ex_showroom_price) +
    Number(gst_amount) +
    Number(insurance_amount) +
    Number(rto_amount) +
    Number(accessories_amount) -
    Number(discount_amount);

  const { rows } = await pool.query(
    `
    INSERT INTO order_price_breakdown
    (
      order_id,
      ex_showroom_price,
      gst_amount,
      insurance_amount,
      rto_amount,
      accessories_amount,
      discount_amount,
      total_amount
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      orderId,
      ex_showroom_price,
      gst_amount,
      insurance_amount,
      rto_amount,
      accessories_amount,
      discount_amount,
      total_amount
    ]
  );

  return rows[0];
};

/* ============================
   PRICE CONFIRMATION (NEW)
============================ */
export const confirmPrice = async (orderId) => {
  await pool.query(
    `
    UPDATE order_price_breakdown
    SET final_amount = total_amount,
        price_confirmed_at = NOW()
    WHERE order_id = $1
    `,
    [orderId]
  );

  const { rows } = await pool.query(
    `
    UPDATE orders
    SET final_price = (
      SELECT final_amount
      FROM order_price_breakdown
      WHERE order_id = $1
    ),
    order_status = 'PRICE_CONFIRMED'
    WHERE id = $1
    RETURNING *
    `,
    [orderId]
  );

  return rows[0];
};

/* ============================
   GET ORDERS BY DEALER (RECENT FIRST)
============================ */
export const getOrdersByDealer = async (dealerId, { status, limit = 50, offset = 0 } = {}) => {
  const values = [dealerId];
  let whereClause = "dealer_id = $1";

  if (status) {
    values.push(status);
    whereClause += ` AND order_status = $${values.length}`;
  }

  values.push(limit, offset);

  const { rows } = await pool.query(
    `
    SELECT 
      o.id,
      o.user_id,
      o.dealer_id,
      o.vehicle_type,
      o.vehicle_id,
      o.base_price,
      o.final_price,
      o.order_status,
      o.created_at
    FROM orders o
    WHERE ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
    `,
    values
  );

  return rows;
};

/* ============================
   GET ORDERS BY USER (RECENT FIRST)
============================ */
export const getOrdersByUser = async (userId, { status, limit = 50, offset = 0 } = {}) => {
  const values = [userId];
  let whereClause = "user_id = $1";

  if (status) {
    values.push(status);
    whereClause += ` AND order_status = $${values.length}`;
  }

  values.push(limit, offset);

  const { rows } = await pool.query(
    `
    SELECT 
      o.id,
      o.user_id,
      o.dealer_id,
      o.vehicle_type,
      o.vehicle_id,
      o.base_price,
      o.final_price,
      o.order_status,
      o.created_at
    FROM orders o
    WHERE ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
    `,
    values
  );

  return rows;
};

/* ============================
   EMI DETAILS (OPTIONAL)
============================ */
export const addEmiDetails = async (orderId, data) => {
  const { rows } = await pool.query(
    `
    INSERT INTO order_emi_details
    (order_id, bank_name, interest_rate, tenure_years,
     down_payment, monthly_emi, processing_fee)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [
      orderId,
      data.bank_name,
      data.interest_rate,
      data.tenure_years,
      data.down_payment,
      data.monthly_emi,
      data.processing_fee
    ]
  );

  return rows[0];
};

/* ============================
   INSURANCE DETAILS (OPTIONAL)
============================ */
export const addInsuranceDetails = async (orderId, data) => {
  const { rows } = await pool.query(
    `
    INSERT INTO order_insurance_details
    (order_id, provider_name, plan_name,
     coverage_type, premium_amount, tenure_years)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [
      orderId,
      data.provider_name,
      data.plan_name,
      data.coverage_type,
      data.premium_amount,
      data.tenure_years
    ]
  );

  return rows[0];
};

/* ============================
   PAYMENT (NEW)
============================ */
export const makePayment = async (orderId, data) => {
  const { rows } = await pool.query(
    `
    INSERT INTO payments
    (order_id, payment_method, payment_status,
     transaction_id, paid_amount, paid_at)
    VALUES ($1,$2,'SUCCESS',$3,$4,NOW())
    RETURNING *
    `,
    [
      orderId,
      data.payment_method,
      data.transaction_id,
      data.paid_amount
    ]
  );

  await pool.query(
    `
    UPDATE orders
    SET order_status = 'PAID'
    WHERE id = $1
    `,
    [orderId]
  );

  return rows[0];
};

export const payOrder = async (orderId, data) => {
  const {
    payment_method,
    transaction_id = `TXN${Date.now()}`,
    payment_status = "SUCCESS",
    paid_amount,
    amount
  } = data;

  // Validate EMI payment has EMI details
  if (payment_method === "EMI") {
    const emiCheckRes = await pool.query(
      `SELECT id FROM order_emi_details WHERE order_id = $1`,
      [orderId]
    );
    if (emiCheckRes.rows.length === 0) {
      throw new Error("EMI details not found. Please go back to checkout and select EMI again.");
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 1️⃣ Get order + amount + vehicle - Lock only orders table */
    const orderRes = await client.query(
      `
      SELECT 
        o.id,
        o.order_status,
        o.vehicle_id,
        o.final_price,
        o.base_price
      FROM orders o
      WHERE o.id = $1
      FOR UPDATE
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      throw new Error("Order not found");
    }
    const { vehicle_id, order_status, final_price, base_price } = orderRes.rows[0];

    /* ❌ Prevent double payment */
    if (order_status === "PAID") {
      throw new Error("Order already paid");
    }

    /* Get price breakdown separately */
    const priceRes = await client.query(
      `SELECT total_amount FROM order_price_breakdown WHERE order_id = $1`,
      [orderId]
    );
    const total_amount = priceRes.rows[0]?.total_amount ?? null;

    /* Amount priority: explicit paid_amount > amount > price breakdown > final_price > base_price */
    const amountToCharge =
      paid_amount ??
      amount ??
      total_amount ??
      final_price ??
      base_price ??
      0;

    /* EMI is paid via CARD - map EMI to CARD for payment method */
    const storedPaymentMethod = payment_method === "EMI" ? "CARD" : payment_method;

    /* 2️⃣ Create payment (dummy success) */
    const paymentRes = await client.query(
      `
      INSERT INTO payments
      (order_id, payment_method, payment_status, paid_amount, paid_at, transaction_id)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING *
      `,
      [orderId, storedPaymentMethod, payment_status, amountToCharge, transaction_id]
    );

    if (paymentRes.rows.length === 0) {
      throw new Error("Failed to create payment record");
    }

    /* 3️⃣ Update order status */
    const updateRes = await client.query(
      `
      UPDATE orders
      SET order_status = 'PAID',
          final_price = COALESCE(final_price, $2)
      WHERE id = $1
      RETURNING *
      `,
      [orderId, amountToCharge]
    );

    if (updateRes.rows.length === 0) {
      throw new Error("Failed to update order status");
    }

    /* 4️⃣ Reduce car stock SAFELY - only if vehicle_id exists */
    if (vehicle_id) {
      const updateRes = await client.query(
        `
        UPDATE cars
        SET
          stock_quantity = stock_quantity - 1,
          stock_status = CASE
            WHEN stock_quantity - 1 <= 0 THEN 'OUT_OF_STOCK'
            WHEN stock_quantity - 1 <= 5 THEN 'LIMITED_STOCK'
            ELSE 'IN_STOCK'
          END
        WHERE id = $1
          AND stock_quantity > 0
        RETURNING *
        `,
        [vehicle_id]
      );
      
      if (updateRes.rows.length === 0) {
        console.warn(`Warning: Could not update stock for vehicle ${vehicle_id} (may not exist or stock is 0)`);
      }
    }

    await client.query("COMMIT");

    return paymentRes.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/* ============================
   GET FULL ORDER
============================ */
export const getOrderById = async (orderId) => {
  const { rows } = await pool.query(
    `
    SELECT
      o.id,
      o.user_id,
      o.dealer_id,
      o.vehicle_type,
      o.vehicle_id,
      o.base_price,
      o.final_price,
      o.order_status,
      o.created_at,
      pb.id as price_breakdown_id,
      pb.ex_showroom_price,
      pb.gst_amount,
      pb.insurance_amount,
      pb.rto_amount,
      pb.accessories_amount,
      pb.discount_amount,
      pb.total_amount,
      pb.final_amount,
      pb.price_confirmed_at,
      emi.bank_name,
      emi.interest_rate,
      emi.monthly_emi,
      emi.tenure_years,
      emi.down_payment,
      emi.processing_fee,
      ins.provider_name,
      ins.plan_name,
      ins.coverage_type,
      ins.premium_amount,
      pay.payment_method,
      pay.payment_status,
      pay.paid_amount
    FROM orders o
    LEFT JOIN order_price_breakdown pb ON pb.order_id = o.id
    LEFT JOIN order_emi_details emi ON emi.order_id = o.id
    LEFT JOIN order_insurance_details ins ON ins.order_id = o.id
    LEFT JOIN payments pay ON pay.order_id = o.id
    WHERE o.id = $1
    `,
    [orderId]
  );

  if (!rows.length) return null;

  const row = rows[0];

  // Restructure flat response into nested objects for frontend compatibility
  return {
    id: row.id,
    user_id: row.user_id,
    dealer_id: row.dealer_id,
    vehicle_type: row.vehicle_type,
    vehicle_id: row.vehicle_id,
    base_price: row.base_price,
    final_price: row.final_price,
    order_status: row.order_status,
    created_at: row.created_at,
    price_breakdown: row.ex_showroom_price ? {
      ex_showroom_price: row.ex_showroom_price,
      gst_amount: row.gst_amount,
      insurance_amount: row.insurance_amount,
      rto_amount: row.rto_amount,
      accessories_amount: row.accessories_amount,
      discount_amount: row.discount_amount,
      total_amount: row.total_amount,
      final_amount: row.final_amount,
      price_confirmed_at: row.price_confirmed_at
    } : null,
    emi_details: row.bank_name ? {
      bank_name: row.bank_name,
      interest_rate: row.interest_rate,
      monthly_emi: row.monthly_emi,
      tenure_years: row.tenure_years,
      down_payment: row.down_payment,
      processing_fee: row.processing_fee
    } : null,
    insurance_details: row.provider_name ? {
      provider_name: row.provider_name,
      plan_name: row.plan_name,
      coverage_type: row.coverage_type,
      premium_amount: row.premium_amount
    } : null,
    payment: row.payment_method ? {
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      paid_amount: row.paid_amount
    } : null
  };
};
