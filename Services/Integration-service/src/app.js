import express from "express";
import cors from "cors";
import morgan from "morgan";
import financeRoutes from "./Routes/finance.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/finance", financeRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Integration Service Running" });
});
