import express from "express";
import cors from "cors";
import morgan from "morgan";

import vehiclesRoutes from "./routes/vehicles.routes.js";

const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Vehicle Service",
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   ROUTES
================================ */
app.use("/vehicles", vehiclesRoutes);

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

export default app;