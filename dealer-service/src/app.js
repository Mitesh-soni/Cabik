import express from "express"
import cors from "cors"
import morgan from "morgan"
import dealerRoutes from "./routes/dealer.routes.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/dealer",dealerRoutes);

export default app;