import express from "express"
import cors from "cors"
import morgan from "morgan"

import userRoutes from "./routes/user.routes.js"
import dealerRoutes from "./routes/dealer.routes.js"
import carRoutes from "./routes/car.routes.js"
import bikeRoutes from "./routes/bike.routes.js"
import scootiesRoutes from "./routes/scooty.routes.js"

const app = express();

//Middleware
app.use(cors());//for diffrent Port
app.use(express.json());//covert json into javascript object type
app.use(morgan("div"));

//Routes
app.use("/users",userRoutes);
app.use("/dealer",dealerRoutes);
app.use("/vehicles/cars",carRoutes);
app.use("/vehicles/bikes",bikeRoutes);
app.use("/vehicles/scooties",scootiesRoutes);

app.get("/",(req,res)=>{
    res.json({status: "API Gateway Running"});
});

export default app;