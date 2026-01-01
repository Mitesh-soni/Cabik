import dotenv from "dotenv";
import pool from "./src/config/db.js";

dotenv.config();

const addDealerColumns = async () => {
  try {
    console.log("🔧 Adding dealer_id and status columns to vehicle tables...");

    // Tables to update
    const tables = ['cars', 'bikes', 'scootys'];

    for (const table of tables) {
      // Check if dealer_id column exists
      const checkDealerId = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'dealer_id'
      `, [table]);

      if (checkDealerId.rows.length === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN dealer_id INTEGER REFERENCES dealers(id)`);
        console.log(`✅ Added dealer_id column to ${table}`);
      } else {
        console.log(`ℹ️  dealer_id already exists in ${table}`);
      }

      // Check if status column exists
      const checkStatus = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'status'
      `, [table]);

      if (checkStatus.rows.length === 0) {
        await pool.query(`
          ALTER TABLE ${table} 
          ADD COLUMN status VARCHAR(20) DEFAULT 'available'
        `);
        console.log(`✅ Added status column to ${table}`);
      } else {
        console.log(`ℹ️  status already exists in ${table}`);
      }

      // Check if created_at column exists
      const checkCreatedAt = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'created_at'
      `, [table]);

      if (checkCreatedAt.rows.length === 0) {
        await pool.query(`
          ALTER TABLE ${table} 
          ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log(`✅ Added created_at column to ${table}`);
      } else {
        console.log(`ℹ️  created_at already exists in ${table}`);
      }
    }

    console.log("\n✅ Vehicle tables updated successfully!");
    console.log("\nStatus values:");
    console.log("  - available: Vehicle is in inventory");
    console.log("  - sold: Vehicle has been purchased");
    console.log("  - reserved: Vehicle is reserved for a customer");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

addDealerColumns();
