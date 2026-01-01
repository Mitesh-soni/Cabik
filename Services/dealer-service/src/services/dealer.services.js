import pool from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Normalize time frame into query granularity and bucket counts
const getTimeFrameConfig = (timeFrame = "monthly") => {
  const frame = ["weekly", "monthly", "yearly"].includes(timeFrame) ? timeFrame : "monthly";
  if (frame === "weekly") {
    return { granularity: "day", periods: 7, label: "weekday" };
  }
  if (frame === "yearly") {
    return { granularity: "month", periods: 12, label: "month" };
  }
  return { granularity: "month", periods: 6, label: "month" };
};

const formatKey = (date, granularity) => {
  const d = new Date(date);
  if (granularity === "month") {
    d.setDate(1);
  }
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const makeBuckets = (granularity, periods, labelType) => {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = periods - 1; i >= 0; i--) {
    const d = new Date(today);
    if (granularity === "day") {
      d.setDate(d.getDate() - i);
    } else {
      d.setMonth(d.getMonth() - i, 1);
    }
    d.setHours(0, 0, 0, 0);

    const label = labelType === "weekday"
      ? d.toLocaleDateString("en-US", { weekday: "short" })
      : d.toLocaleDateString("en-US", { month: "short" });

    buckets.push({
      date: d,
      key: formatKey(d, granularity),
      label
    });
  }

  return buckets;
};

const getDealerTimeSeries = async (dealerId, timeFrame = "monthly") => {
  const { granularity, periods, label } = getTimeFrameConfig(timeFrame);
  const buckets = makeBuckets(granularity, periods, label);
  const startDate = buckets[0]?.date || new Date();

  const query = `
    SELECT 
      date_trunc('${granularity}', created_at) AS period,
      COUNT(*) AS sales,
      SUM(COALESCE(final_price, base_price, 0)) AS revenue
    FROM orders
    WHERE dealer_id = $1 AND created_at >= $2
    GROUP BY period
    ORDER BY period ASC
  `;

  const result = await pool.query(query, [dealerId, startDate]);
  const dataMap = new Map();

  result.rows.forEach(row => {
    const key = formatKey(row.period, granularity);
    dataMap.set(key, {
      sales: Number(row.sales) || 0,
      revenue: Number(row.revenue) || 0
    });
  });

  const salesData = buckets.map(bucket => ({
    month: bucket.label,
    sales: dataMap.get(bucket.key)?.sales || 0
  }));

  const revenueData = buckets.map(bucket => ({
    month: bucket.label,
    revenue: dataMap.get(bucket.key)?.revenue || 0
  }));

  return { salesData, revenueData };
};

export const createDealer = async (data) => {
  const {
    company_name,
    owner_name,
    gst_number,
    license_number,
    pan_number,
    cin_number,
    registration_date,
    email,
    phone,
    whatsapp_number,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    password,
    license_document
  } = data;

  // Validate required fields
  if (!company_name || !owner_name || !email || !password || !phone) {
    throw new Error("Required fields: company_name, owner_name, email, password, phone");
  }

  // Check duplicate email
  const exists = await pool.query(
    "SELECT id FROM dealers WHERE email = $1",
    [email]
  );

  if (exists.rows.length > 0) {
    throw new Error("Dealer email already exists");
  }

  // Hash the password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const query = `
    INSERT INTO dealers (
      company_name, owner_name, gst_number, license_number,
      pan_number, cin_number, registration_date, email,
      phone, whatsapp_number, address_line1, address_line2,
      city, state, pincode, password_hash, license_document,
      car_ids, bike_ids, scooty_ids
    )
    VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10, $11, $12,
      $13, $14, $15, $16, $17,
      '{}', '{}', '{}'
    )
    RETURNING id, company_name, owner_name, email, phone, city, state;
  `;

  const values = [
    company_name,
    owner_name,
    gst_number || null,
    license_number || null,
    pan_number || null,
    cin_number || null,
    registration_date || null,
    email,
    phone,
    whatsapp_number || null,
    address_line1 || null,
    address_line2 || null,
    city,
    state,
    pincode,
    password_hash,
    license_document || null
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getDealerById = async (id) => {
  const result = await pool.query(
    `SELECT 
       id,
       company_name,
       owner_name,
       city,
       state,
       phone,
       email,
       COALESCE(rating, 4.5) AS rating,
       car_ids,
       bike_ids,
       scooty_ids
     FROM dealers
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  return result.rows[0];
};

export const getDealerAnalytics = async (dealerId, timeFrame = "monthly") => {
  const dealer = await getDealerById(dealerId);
  
  if (!dealer) {
    throw new Error("Dealer not found");
  }

  // Count vehicles from actual tables instead of relying on arrays
  const vehicleCount = await pool.query(
    `SELECT 
       (SELECT COUNT(*) FROM cars WHERE dealer_id = $1) as car_count,
       (SELECT COUNT(*) FROM bikes WHERE dealer_id = $1) as bike_count,
       (SELECT COUNT(*) FROM scooties WHERE dealer_id = $1) as scooty_count
    `,
    [dealerId]
  );

  const { car_count, bike_count, scooty_count } = vehicleCount.rows[0];
  const totalVehicles = Number(car_count || 0) + Number(bike_count || 0) + Number(scooty_count || 0);

  // Aggregate orders for this dealer with status breakdown
  const ordersAgg = await pool.query(
    `SELECT 
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE order_status = 'PAID') AS success_orders,
        COUNT(*) FILTER (WHERE order_status = 'FAILED') AS failed_orders,
        COUNT(*) FILTER (WHERE order_status NOT IN ('PAID','FAILED')) AS pending_orders,
        COALESCE(SUM(COALESCE(final_price, base_price, 0)), 0) AS total_revenue,
        COALESCE(SUM(CASE 
          WHEN created_at >= date_trunc('month', NOW()) THEN COALESCE(final_price, base_price, 0)
          ELSE 0
        END), 0) AS monthly_revenue
     FROM orders
     WHERE dealer_id = $1
    `,
    [dealerId]
  );

  const { total_orders, success_orders, failed_orders, pending_orders, total_revenue, monthly_revenue } = ordersAgg.rows[0];

  const { salesData, revenueData } = await getDealerTimeSeries(dealerId, timeFrame);

  // Get vehicle categories breakdown from actual counts
  const vehicleCategories = [
    { name: "Cars", value: Number(car_count || 0) },
    { name: "Bikes", value: Number(bike_count || 0) },
    { name: "Scooties", value: Number(scooty_count || 0) }
  ];

  // Calculate average order value
  const avgOrderValue = total_orders > 0 ? (total_revenue / total_orders) : 0;

  return {
    totalVehicles,
    totalOrders: Number(total_orders) || 0,
    totalOrdersSuccess: Number(success_orders) || 0,
    totalOrdersFailed: Number(failed_orders) || 0,
    totalOrdersPending: Number(pending_orders) || 0,
    totalRevenue: Number(total_revenue) || 0,
    monthlyRevenue: Number(monthly_revenue) || 0,
    avgOrderValue: Number(avgOrderValue) || 0,
    salesData,
    revenueData,
    vehicleCategories
  };
};

export const getDealerRevenue = async (dealerId, timeFrame = "monthly") => {
  const dealer = await getDealerById(dealerId);
  if (!dealer) {
    throw new Error("Dealer not found");
  }

  const { revenueData } = await getDealerTimeSeries(dealerId, timeFrame);
  return { revenueData };
};

export const getDealerOrders = async (dealerId, filters = {}) => {
  const { limit = 50, offset = 0, status } = filters;

  let query = `
    SELECT 
      id, user_id, vehicle_id, vehicle_type,
      base_price, final_price, order_status,
      created_at
    FROM orders
    WHERE dealer_id = $1
  `;

  const params = [dealerId];

  if (status) {
    query += ` AND order_status = $${params.length + 1}`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Count total orders
  let countQuery = `SELECT COUNT(*) as count FROM orders WHERE dealer_id = $1`;
  const countParams = [dealerId];
  if (status) {
    countQuery += ` AND order_status = $${countParams.length + 1}`;
    countParams.push(status);
  }
  const countResult = await pool.query(countQuery, countParams);

  return {
    orders: result.rows,
    total: Number(countResult.rows[0]?.count || 0),
    limit,
    offset
  };
};

export const loginDealer = async (email, password) => {
  const result = await pool.query(
    `SELECT 
       id,
       company_name,
       owner_name,
       city,
       state,
       phone,
       email,
       password_hash
     FROM dealers
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Dealer not found");
  }

  const dealer = result.rows[0];
  
  // Use bcrypt to compare passwords
  const isPasswordValid = await bcrypt.compare(password, dealer.password_hash);
  
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Remove password from response
  delete dealer.password_hash;
  return dealer;
};

// Vehicle Management
export const uploadVehicle = async (vehicleData, dealerId) => {
  const {
    brand, model, variant, fuel_type, transmission,
    seating_capacity, engine_cc, mileage, launch_year,
    ex_showroom_price, description, vehicle_type = 'car'
  } = vehicleData;

  const tableName = vehicle_type === 'bike' ? 'bikes' : vehicle_type === 'scooty' ? 'scooties' : 'cars';
  const columnName = vehicle_type === 'bike' ? 'bike_ids' : vehicle_type === 'scooty' ? 'scooty_ids' : 'car_ids';
  
  const query = `
    INSERT INTO ${tableName} (
      brand, model, variant, fuel_type, transmission,
      seating_capacity, engine_cc, mileage, launch_year,
      ex_showroom_price, description, dealer_id, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'available')
    RETURNING *
  `;

  const values = [
    brand, model, variant, fuel_type, transmission,
    seating_capacity, engine_cc, mileage, launch_year,
    ex_showroom_price, description, dealerId
  ];

  const result = await pool.query(query, values);
  const newVehicle = result.rows[0];
  
  // Add the vehicle ID to the dealer's array
  await pool.query(
    `UPDATE dealers 
     SET ${columnName} = array_append(${columnName}, $1) 
     WHERE id = $2`,
    [newVehicle.id, dealerId]
  );
  
  return newVehicle;
};

export const getDealerVehicles = async (dealerId) => {
  // First, get the dealer's vehicle IDs from the dealers table
  const dealerResult = await pool.query(
    `SELECT 
       COALESCE(car_ids, '{}') as car_ids, 
       COALESCE(bike_ids, '{}') as bike_ids, 
       COALESCE(scooty_ids, '{}') as scooty_ids 
     FROM dealers 
     WHERE id = $1`,
    [dealerId]
  );

  if (!dealerResult.rows.length) {
    return [];
  }

  const { car_ids, bike_ids, scooty_ids } = dealerResult.rows[0];
  const vehicles = [];

  // Fetch cars if car_ids exist
  if (Array.isArray(car_ids) && car_ids.length > 0) {
    const cars = await pool.query(
      `SELECT *, 'car' as vehicle_type FROM cars WHERE id = ANY($1::int[]) ORDER BY created_at DESC`,
      [car_ids]
    );
    vehicles.push(...cars.rows);
  }
  
  // Fetch bikes if bike_ids exist
  if (Array.isArray(bike_ids) && bike_ids.length > 0) {
    const bikes = await pool.query(
      `SELECT *, 'bike' as vehicle_type FROM bikes WHERE id = ANY($1::int[]) ORDER BY created_at DESC`,
      [bike_ids]
    );
    vehicles.push(...bikes.rows);
  }
  
  // Fetch scootys if scooty_ids exist
  if (Array.isArray(scooty_ids) && scooty_ids.length > 0) {
    const scootys = await pool.query(
      `SELECT *, 'scooty' as vehicle_type FROM scooties WHERE id = ANY($1::int[]) ORDER BY created_at DESC`,
      [scooty_ids]
    );
    vehicles.push(...scootys.rows);
  }

  return vehicles;
};

export const updateVehicle = async (vehicleId, data) => {
  const { vehicle_type = 'car', ...updateData } = data;
  const tableName = vehicle_type === 'bike' ? 'bikes' : vehicle_type === 'scooty' ? 'scooties' : 'cars';
  
  const fields = Object.keys(updateData).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
  const values = [...Object.values(updateData), vehicleId];
  
  const query = `UPDATE ${tableName} SET ${fields} WHERE id = $${values.length} RETURNING *`;
  const result = await pool.query(query, values);
  
  return result.rows[0];
};

export const deleteVehicle = async (vehicleId, vehicleType = 'car', dealerId) => {
  const tableName = vehicleType === 'bike' ? 'bikes' : vehicleType === 'scooty' ? 'scooties' : 'cars';
  const columnName = vehicleType === 'bike' ? 'bike_ids' : vehicleType === 'scooty' ? 'scooty_ids' : 'car_ids';
  
  // Delete the vehicle
  await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [vehicleId]);
  
  // Remove the vehicle ID from dealer's array if dealerId is provided
  if (dealerId) {
    await pool.query(
      `UPDATE dealers 
       SET ${columnName} = array_remove(${columnName}, $1) 
       WHERE id = $2`,
      [vehicleId, dealerId]
    );
  }
};
