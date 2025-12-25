import express from "express";
import cors from "cors";
import morgan from "morgan";
import ordersRoutes from "./routes/order.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/orders", ordersRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Orders Service Running" });
});

export default app;