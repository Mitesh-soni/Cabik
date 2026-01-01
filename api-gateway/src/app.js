import express from "express"
import cors from "cors"
import morgan from "morgan"

import userRoutes from "./routes/user.routes.js"
import dealerRoutes from "./routes/dealer.routes.js"
import vehicleRoutes from "./routes/vehicles.routes.js"
import financeRoutes from "./routes/finance.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

//Middleware
app.set("etag", false); // disable 304 caching for APIs
app.use(cors());//for diffrent Port
app.use(express.json());//covert json into javascript object type
app.use(morgan("dev"));

//Routes
app.use("/users",userRoutes);
app.use("/dealer",dealerRoutes);
app.use("/dealers",dealerRoutes); // Also mount at /dealers for dealer-panel
app.use("/vehicles",vehicleRoutes);
app.use("/finance",financeRoutes);
app.use("/orders",orderRoutes);

app.get("/",(req,res)=>{
    res.json({status: "API Gateway Running"});
});

export default app;