import dotenv from "dotenv";
import pool from "./src/config/db.js";

dotenv.config();

const seedOrders = async () => {
  try {
    console.log("🌱 Seeding test orders...");

    // Get the dealer ID (assuming dealer_id = 1 from the seed script)
    const dealerResult = await pool.query("SELECT id FROM dealers LIMIT 1");
    if (dealerResult.rows.length === 0) {
      console.error("❌ No dealers found. Please run seed.js first.");
      process.exit(1);
    }
    const dealerId = dealerResult.rows[0].id;
    console.log(`Using dealer ID: ${dealerId}`);

    // Get some user IDs (or create dummy ones)
    const userResult = await pool.query("SELECT id FROM users LIMIT 5");
    const userIds = userResult.rows.length > 0 
      ? userResult.rows.map(r => r.id) 
      : [1, 2, 3, 4, 5]; // Fallback to dummy IDs

    // Sample orders data
    const orders = [
      { user_id: userIds[0], vehicle_id: 1, vehicle_type: 'CAR', base_price: 800000, final_price: 850000, status: 'PAID' },
      { user_id: userIds[1], vehicle_id: 2, vehicle_type: 'BIKE', base_price: 95000, final_price: 100000, status: 'PAID' },
      { user_id: userIds[2], vehicle_id: 3, vehicle_type: 'SCOOTY', base_price: 70000, final_price: 75000, status: 'PAID' },
      { user_id: userIds[0], vehicle_id: 4, vehicle_type: 'CAR', base_price: 1200000, final_price: 1250000, status: 'PRICE_CONFIRMED' },
      { user_id: userIds[3], vehicle_id: 5, vehicle_type: 'BIKE', base_price: 120000, final_price: 125000, status: 'PAID' },
      { user_id: userIds[4], vehicle_id: 6, vehicle_type: 'CAR', base_price: 650000, final_price: 680000, status: 'PAID' },
      { user_id: userIds[1], vehicle_id: 7, vehicle_type: 'SCOOTY', base_price: 65000, final_price: 68000, status: 'PAID' },
      { user_id: userIds[2], vehicle_id: 8, vehicle_type: 'BIKE', base_price: 85000, final_price: 90000, status: 'PAID' },
      { user_id: userIds[3], vehicle_id: 9, vehicle_type: 'CAR', base_price: 950000, final_price: 980000, status: 'PRICE_CONFIRMED' },
      { user_id: userIds[4], vehicle_id: 10, vehicle_type: 'SCOOTY', base_price: 72000, final_price: 76000, status: 'PAID' },
    ];

    let insertedCount = 0;

    for (const order of orders) {
      await pool.query(
        `INSERT INTO orders (
          dealer_id, user_id, vehicle_id, vehicle_type,
          base_price, final_price, order_status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          dealerId,
          order.user_id,
          order.vehicle_id,
          order.vehicle_type,
          order.base_price,
          order.final_price,
          order.status
        ]
      );
      insertedCount++;
    }

    console.log(`✅ Successfully seeded ${insertedCount} test orders for dealer ${dealerId}`);
    
    // Verify the orders were inserted
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE dealer_id = $1",
      [dealerId]
    );
    console.log(`Total orders for dealer ${dealerId}: ${countResult.rows[0].count}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding orders:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seedOrders();
