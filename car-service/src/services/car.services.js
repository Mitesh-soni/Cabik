import pool from "../config/db.js";

/* ------------------------------------------------------------------
   ADD A SINGLE CAR
-------------------------------------------------------------------*/
export const addCar = async (data) => {
  const {
    dealer_id,
    brand,
    model,
    variant,
    launch_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    seating_capacity,
    body_type,
    engine_cc,
    power_bhp,
    torque_nm,
    mileage,
    colors,
    features,
    front_image,
    back_image,
    side_image,
    interior_image,
  } = data;

  const carQuery = `
    INSERT INTO cars (
      dealer_id, brand, model, variant, launch_year,
      ex_showroom_price, on_road_price, fuel_type, transmission,
      seating_capacity, body_type, engine_cc, power_bhp, torque_nm,
      mileage, colors, features, front_image, back_image,
      side_image, interior_image
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,
      $10,$11,$12,$13,$14,
      $15,$16,$17,$18,$19,$20,$21
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
    fuel_type,
    transmission,
    seating_capacity,
    body_type,
    engine_cc,
    power_bhp,
    torque_nm,
    mileage,
    colors || [],
    features || [],
    front_image,
    back_image,
    side_image,
    interior_image,
  ];

  // Insert new car
  const result = await pool.query(carQuery, values);
  const carId = result.rows[0].id;

  // Add carId to dealer's car_ids array
  await pool.query(
    `UPDATE dealers SET car_ids = array_append(car_ids, $1) WHERE id = $2`,
    [carId, dealer_id]
  );

  return { car_id: carId };
};

/* ------------------------------------------------------------------
   GET ALL CARS
-------------------------------------------------------------------*/
export const getAllCars = async () => {
  const query = "SELECT * FROM cars ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
};

/* ------------------------------------------------------------------
   GET CAR BY ID
-------------------------------------------------------------------*/
export const getCarById = async (id) => {
  const query = "SELECT * FROM cars WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* ------------------------------------------------------------------
   GET ALL CARS OF A DEALER
-------------------------------------------------------------------*/
export const getCarsByDealer = async (dealerId) => {
  const query = `
    SELECT * FROM cars 
    WHERE dealer_id = $1 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [dealerId]);
  return result.rows;
};

/* ------------------------------------------------------------------
   FILTER CARS
   Supports: brand, fuel, body type, price range, mileage range
-------------------------------------------------------------------*/
export const filterCars = async (filters) => {
  const {
    brand,
    fuel_type,
    body_type,
    min_price,
    max_price,
    min_mileage,
    max_mileage,
  } = filters;

  let query = "SELECT * FROM cars WHERE 1=1";
  const params = [];
  let i = 1;

  if (brand) {
    query += ` AND brand ILIKE $${i++}`;
    params.push(`%${brand}%`);
  }

  if (fuel_type) {
    query += ` AND fuel_type ILIKE $${i++}`;
    params.push(`%${fuel_type}%`);
  }

  if (body_type) {
    query += ` AND body_type ILIKE $${i++}`;
    params.push(`%${body_type}%`);
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

  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};
