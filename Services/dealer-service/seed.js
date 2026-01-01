import dotenv from "dotenv";
import pool from "./src/config/db.js";

dotenv.config();

const seedDealers = async () => {
  try {
    console.log("🌱 Seeding test dealer...");

    // Check if dealer already exists
    const existing = await pool.query(
      "SELECT id FROM dealers WHERE email = $1",
      ["dealer@cabik.com"]
    );

    if (existing.rows.length > 0) {
      console.log("✅ Test dealer already exists");
      process.exit(0);
    }

    // Insert test dealer
    const result = await pool.query(
      `INSERT INTO dealers (
        company_name, owner_name, email, phone, 
        address_line1, city, state, pincode,
        car_ids, bike_ids, scooty_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        "CABIK Test Dealer",
        "Test Owner",
        "dealer@cabik.com",
        "9876543210",
        "123 Test Street",
        "Mumbai",
        "Maharashtra",
        "400001",
        "{}",
        "{}",
        "{}"
      ]
    );

    console.log("✅ Test dealer created successfully:");
    console.log("Email: dealer@cabik.com");
    console.log("Password: password123");
    console.log("ID:", result.rows[0].id);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding dealer:", err.message);
    process.exit(1);
  }
};

seedDealers();
