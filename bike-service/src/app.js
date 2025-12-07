import express from "express";
import cors from "cors";
import morgan from "morgan";
import bikeRoutes from "./routes/bike.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/bikes", bikeRoutes);

export default app;