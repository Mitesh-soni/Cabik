import express from "express";
import cors from "cors";
import morgan from "morgan";
import scootyRoutes from "./routes/scooty.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/scooties", scootyRoutes);

export default app;
