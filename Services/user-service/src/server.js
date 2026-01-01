import dotenv from "dotenv";
import app from "./app.js";
import { createUserTable } from "./models/user.model.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

createUserTable().catch((err) => {
  console.error("Failed to ensure users table exists", err);
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});