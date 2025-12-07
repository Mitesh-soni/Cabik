import pool from "../config/db.js";

/* ------------------- ADD SCOOTY ------------------- */
export const addScooty = async (data) => {
  const {
    dealer_id,
    brand,
    model,
    variant,
    launch_year,
    ex_showroom_price,
    on_road_price,
    engine_cc,
    power_bhp,
    torque_nm,
    mileage,
    colors,
    features,
    front_image,
    side_image,
    back_image
  } = data;

  const query = `
    INSERT INTO scooties (
      dealer_id, brand, model, variant, launch_year,
      ex_showroom_price, on_road_price, engine_cc, power_bhp, torque_nm,
      mileage, colors, features, front_image, side_image, back_image
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16
    )
    RETURNING id;
  `;

  const values = [
    dealer_id,
    brand,
    model,
    variant,
    launch_year,
    ex_showroom_price,
    on_road_price,
    engine_cc,
    power_bhp,
    torque_nm,
    mileage,
    colors || [],
    features || [],
    front_image,
    side_image,
    back_image
  ];

  const result = await pool.query(query, values);
  const scootyId = result.rows[0].id;

  // Update dealer scooty_ids
  await pool.query(
    `UPDATE dealers SET scooty_ids = array_append(scooty_ids, $1) WHERE id = $2`,
    [scootyId, dealer_id]
  );

  return { scooty_id: scootyId };
};

/* ------------------- GET ALL SCOOTIES ------------------- */
export const getAllScooties = async () => {
  const result = await pool.query(
    "SELECT * FROM scooties ORDER BY created_at DESC"
  );
  return result.rows;
};

/* ------------------- GET SCOOTY BY ID ------------------- */
export const getScootyById = async (id) => {
  const result = await pool.query("SELECT * FROM scooties WHERE id = $1", [id]);
  return result.rows[0];
};

/* ------------------- GET SCOOTIES BY DEALER ------------------- */
export const getScootiesByDealer = async (dealerId) => {
  const result = await pool.query(
    "SELECT * FROM scooties WHERE dealer_id = $1 ORDER BY created_at DESC",
    [dealerId]
  );
  return result.rows;
};

/* ------------------- FILTER SCOOTIES ------------------- */
export const filterScooties = async (filters) => {
  const {
    brand,
    min_price,
    max_price,
    min_mileage,
    max_mileage,
    min_engine_cc,
    max_engine_cc
  } = filters;

  let query = "SELECT * FROM scooties WHERE 1=1";
  const params = [];
  let i = 1;

  if (brand) {
    query += ` AND brand ILIKE $${i++}`;
    params.push(`%${brand}%`);
  }

  if (min_price) {
    query += ` AND ex_showroom_price >= $${i++}`;
    params.push(min_price);
  }

  if (max_price) {
    query += ` AND ex_showroom_price <= $${i++}`;
    params.push(max_price);
  }

  if (min_mileage) {
    query += ` AND mileage >= $${i++}`;
    params.push(min_mileage);
  }

  if (max_mileage) {
    query += ` AND mileage <= $${i++}`;
    params.push(max_mileage);
  }

  if (min_engine_cc) {
    query += ` AND engine_cc >= $${i++}`;
    params.push(min_engine_cc);
  }

  if (max_engine_cc) {
    query += ` AND engine_cc <= $${i++}`;
    params.push(max_engine_cc);
  }

  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};