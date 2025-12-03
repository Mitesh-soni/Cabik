import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5002;


app.listen(PORT, () => {
  console.log(`Dealer Service running on port ${PORT}`);
});