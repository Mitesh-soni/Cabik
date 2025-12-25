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

export const payOrder = async (orderId, payment_method) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 1️⃣ Get order + amount + vehicle */
    const orderRes = await client.query(
      `
      SELECT 
        o.id,
        o.order_status,
        pb.total_amount,
        o.vehicle_id
      FROM orders o
      JOIN order_price_breakdown pb ON pb.order_id = o.id
      WHERE o.id = $1
      FOR UPDATE
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      throw new Error("Order not found");
    }

    const { total_amount, vehicle_id, order_status } = orderRes.rows[0];

    /* ❌ Prevent double payment */
    if (order_status === "PAID") {
      throw new Error("Order already paid");
    }

    /* 2️⃣ Create payment (dummy success) */
    const paymentRes = await client.query(
      `
      INSERT INTO payments
      (order_id, payment_method, payment_status, paid_amount, paid_at)
      VALUES ($1,$2,'SUCCESS',$3,NOW())
      RETURNING *
      `,
      [orderId, payment_method, total_amount]
    );

    /* 3️⃣ Update order status */
    await client.query(
      `
      UPDATE orders
      SET order_status = 'PAID'
      WHERE id = $1
      `,
      [orderId]
    );

    /* 4️⃣ Reduce car stock SAFELY */
    await client.query(
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
      `,
      [vehicle_id]
    );

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
      o.*,
      pb.*,
      emi.bank_name,
      emi.interest_rate,
      emi.monthly_emi,
      emi.tenure_years,
      ins.provider_name,
      ins.plan_name,
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

  return rows[0];
};
