import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emiRoutes from "./routes/emi.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/emi", emiRoutes);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`✅ EMI Service running on port ${PORT}`);
});
