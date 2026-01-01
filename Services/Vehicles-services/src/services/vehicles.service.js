import { pool } from "../db.js";

const VEHICLE_TABLES = {
  car: "cars",
  bike: "bikes",
  scooty: "scooties"
};

const parseNumber = (value, fieldName) => {
  if (value === undefined) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw { status: 400, message: `${fieldName} must be a number` };
  }
  return num;
};

export const getAllVehicles = async (req, res) => {
  try {
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

    const pageNumber = Math.max(1, parseNumber(page, "page") ?? 1);
    const limitNumber = Math.min(Math.max(1, parseNumber(limit, "limit") ?? 12), 100);

    const filters = {
      seating_capacity: parseNumber(seating_capacity, "seating_capacity"),
      min_price: parseNumber(min_price, "min_price"),
      max_price: parseNumber(max_price, "max_price"),
      min_year: parseNumber(min_year, "min_year"),
      max_year: parseNumber(max_year, "max_year"),
      min_engine_cc: parseNumber(min_engine_cc, "min_engine_cc"),
      max_engine_cc: parseNumber(max_engine_cc, "max_engine_cc"),
      min_mileage: parseNumber(min_mileage, "min_mileage"),
      max_mileage: parseNumber(max_mileage, "max_mileage")
    };

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

    if (filters.seating_capacity && table === "cars") {
      query += ` AND seating_capacity >= $${idx++}`;
      values.push(filters.seating_capacity);
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
    if (filters.min_price) {
      query += ` AND ex_showroom_price >= $${idx++}`;
      values.push(filters.min_price);
    }

    if (filters.max_price) {
      query += ` AND ex_showroom_price <= $${idx++}`;
      values.push(filters.max_price);
    }

    if (filters.min_year) {
      query += ` AND launch_year >= $${idx++}`;
      values.push(filters.min_year);
    }

    if (filters.max_year) {
      query += ` AND launch_year <= $${idx++}`;
      values.push(filters.max_year);
    }

    if (filters.min_engine_cc) {
      query += ` AND engine_cc >= $${idx++}`;
      values.push(filters.min_engine_cc);
    }

    if (filters.max_engine_cc) {
      query += ` AND engine_cc <= $${idx++}`;
      values.push(filters.max_engine_cc);
    }

    if (filters.min_mileage) {
      query += ` AND mileage >= $${idx++}`;
      values.push(filters.min_mileage);
    }

    if (filters.max_mileage) {
      query += ` AND mileage <= $${idx++}`;
      values.push(filters.max_mileage);
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
    const offset = (pageNumber - 1) * limitNumber;
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limitNumber, offset);

    const { rows } = await pool.query(query, values);
    res.json({
      page: pageNumber,
      limit: limitNumber,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("FILTER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { type, id } = req.params;
    const normalizedType = type.toLowerCase();
    const table = VEHICLE_TABLES[normalizedType];

    if (!table) {
      return res.status(400).json({ message: "Invalid vehicle type" });
    }

    const vehicleId = parseNumber(id, "id");
    if (!Number.isInteger(vehicleId) || vehicleId < 1) {
      return res.status(400).json({ message: "Invalid vehicle id" });
    }

    const { rows } = await pool.query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [vehicleId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ vehicle: rows[0] });
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: "Vehicle fetch error" });
  }
};
