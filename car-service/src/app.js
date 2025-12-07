import express from "express";
import cors from "cors";
import morgan from "morgan";
import carRoutes from "./routes/car.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/bike", carRoutes);

export default app;