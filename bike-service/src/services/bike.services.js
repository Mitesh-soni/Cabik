import pool from "../config/db.js";

/* ------------------- ADD BIKE ------------------- */
export const addBike = async (data) => {
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
    braking_system,
    colors,
    features,
    front_image,
    back_image,
    side_image
  } = data;

  const query = `
    INSERT INTO bikes (
      dealer_id, brand, model, variant, launch_year,
      ex_showroom_price, on_road_price, engine_cc, power_bhp, torque_nm,
      mileage, braking_system, colors, features,
      front_image, back_image, side_image
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,
      $15,$16,$17
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
    braking_system,
    colors || [],
    features || [],
    front_image,
    back_image,
    side_image
  ];

  const result = await pool.query(query, values);
  const bikeId = result.rows[0].id;

  // Update dealer bike_ids
  await pool.query(
    `UPDATE dealers SET bike_ids = array_append(bike_ids, $1) WHERE id = $2`,
    [bikeId, dealer_id]
  );

  return { bike_id: bikeId };
};

/* ------------------- GET ALL BIKES ------------------- */
export const getAllBikes = async () => {
  const result = await pool.query("SELECT * FROM bikes ORDER BY created_at DESC");
  return result.rows;
};

/* ------------------- GET BIKE BY ID ------------------- */
export const getBikeById = async (id) => {
  const result = await pool.query("SELECT * FROM bikes WHERE id = $1", [id]);
  return result.rows[0];
};

/* ------------------- GET BIKES BY DEALER ------------------- */
export const getBikesByDealer = async (dealerId) => {
  const result = await pool.query(
    "SELECT * FROM bikes WHERE dealer_id = $1 ORDER BY created_at DESC",
    [dealerId]
  );
  return result.rows;
};

/* ------------------- FILTER BIKES ------------------- */
export const filterBikes = async (filters) => {
  const {
    brand,
    braking_system,
    min_price,
    max_price,
    min_mileage,
    max_mileage,
    min_engine_cc,
    max_engine_cc
  } = filters;

  let query = "SELECT * FROM bikes WHERE 1=1";
  const params = [];
  let i = 1;

  if (brand) {
    query += ` AND brand ILIKE $${i++}`;
    params.push(`%${brand}%`);
  }

  if (braking_system) {
    query += ` AND braking_system ILIKE $${i++}`;
    params.push(`%${braking_system}%`);
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