import { pool } from "../db.js";

const VEHICLE_TABLES = {
  car: "cars",
  bike: "bikes",
  scooty: "scooties"
};

export const getAllVehicles = async (req, res) => {
  const { type } = req.params;
  const normalizedType = type.toLowerCase();
  const table = VEHICLE_TABLES[normalizedType];

  if (!table) {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }

  const {
    brand,
    model,
    fuel_type,
    transmission,
    body_type,
    seating_capacity,
    braking_system,
    availability_status,
    min_price,
    max_price,
    min_year,
    max_year,
    min_engine_cc,
    max_engine_cc,
    min_mileage,
    max_mileage,
    color,
    search,
    sort_by = "created_at",
    order = "desc",
    page = 1,
    limit = 12
  } = req.query;

  let query = `SELECT * FROM ${table} WHERE 1=1`;
  const values = [];
  let idx = 1;

  /* ---------- TEXT FILTERS ---------- */
  if (brand) {
    query += ` AND brand ILIKE $${idx++}`;
    values.push(`%${brand}%`);
  }

  if (model) {
    query += ` AND model ILIKE $${idx++}`;
    values.push(`%${model}%`);
  }

  if (search) {
    query += ` AND (brand ILIKE $${idx} OR model ILIKE $${idx})`;
    values.push(`%${search}%`);
    idx++;
  }

  /* ---------- VEHICLE ATTRIBUTES ---------- */
  if (fuel_type && table === "cars") {
    query += ` AND fuel_type = $${idx++}`;
    values.push(fuel_type);
  }

  if (transmission && table === "cars") {
    query += ` AND transmission = $${idx++}`;
    values.push(transmission);
  }

  if (body_type && table === "cars") {
    query += ` AND body_type = $${idx++}`;
    values.push(body_type);
  }

  if (seating_capacity && table === "cars") {
    query += ` AND seating_capacity >= $${idx++}`;
    values.push(seating_capacity);
  }

  if (braking_system && table !== "cars") {
    query += ` AND braking_system = $${idx++}`;
    values.push(braking_system);
  }

  if (availability_status) {
    query += ` AND availability_status = $${idx++}`;
    values.push(availability_status);
  }

  /* ---------- RANGE FILTERS ---------- */
  if (min_price) {
    query += ` AND ex_showroom_price >= $${idx++}`;
    values.push(min_price);
  }

  if (max_price) {
    query += ` AND ex_showroom_price <= $${idx++}`;
    values.push(max_price);
  }

  if (min_year) {
    query += ` AND launch_year >= $${idx++}`;
    values.push(min_year);
  }

  if (max_year) {
    query += ` AND launch_year <= $${idx++}`;
    values.push(max_year);
  }

  if (min_engine_cc) {
    query += ` AND engine_cc >= $${idx++}`;
    values.push(min_engine_cc);
  }

  if (max_engine_cc) {
    query += ` AND engine_cc <= $${idx++}`;
    values.push(max_engine_cc);
  }

  if (min_mileage) {
    query += ` AND mileage >= $${idx++}`;
    values.push(min_mileage);
  }

  if (max_mileage) {
    query += ` AND mileage <= $${idx++}`;
    values.push(max_mileage);
  }

  if (color) {
    query += ` AND $${idx++} = ANY(colors)`;
    values.push(color);
  }

  /* ---------- SORTING ---------- */
  const SORT_FIELDS = ["ex_showroom_price", "launch_year", "mileage", "created_at"];
  const sortField = SORT_FIELDS.includes(sort_by) ? sort_by : "created_at";
  const sortOrder = order === "asc" ? "ASC" : "DESC";

  query += ` ORDER BY ${sortField} ${sortOrder}`;

  /* ---------- PAGINATION ---------- */
  const offset = (page - 1) * limit;
  query += ` LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  try {
    const { rows } = await pool.query(query, values);
    res.json({
      page: Number(page),
      limit: Number(limit),
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error("FILTER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

export const getVehicleById = async (req, res) => {
  const { type, id } = req.params;
  const normalizedType = type.toLowerCase();
  const table = VEHICLE_TABLES[normalizedType];


  if (!table) {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ vehicle: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Vehicle fetch error" });
  }
};
