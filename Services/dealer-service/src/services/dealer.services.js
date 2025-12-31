import pool from "../config/db.js";

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
    pincode
  } = data;

  // Check duplicate email
  const exists = await pool.query(
    "SELECT id FROM dealers WHERE email = $1",
    [email]
  );

  if (exists.rows.length > 0) {
    throw new Error("Dealer email already exists");
  }

  const query = `
    INSERT INTO dealers (
      company_name, owner_name, gst_number, license_number,
      pan_number, cin_number, registration_date, email,
      phone, whatsapp_number, address_line1, address_line2,
      city, state, pincode, car_ids, bike_ids, scooty_ids
    )
    VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10, $11, $12,
      $13, $14, $15, '{}', '{}', '{}'
    )
    RETURNING *;
  `;

  const values = [
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
    pincode
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
       COALESCE(rating, 4.5) AS rating
     FROM dealers
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  return result.rows[0];
};
