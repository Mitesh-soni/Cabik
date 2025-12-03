import dotenv from "dotenv"
import pkg from "pg";
const { Pool } = pkg;

dotenv.config()

console.log("DB PASSWORD LOADED =", JSON.stringify(process.env.DB_PASSWORD));

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
// console.log(process.env.DB_PASSWORD);
export default pool;