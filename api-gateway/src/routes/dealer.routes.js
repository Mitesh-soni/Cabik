import express from "express";
import dotenv from "dotenv";
import { forwardRequest } from "../utils/serviceCaller.js";

dotenv.config();
const router = express.Router();
const DEALER_SERVICE = process.env.DEALER_SERVICE_URL

//Register
router.post("/register",async (req,res)=>{
        try{
            const result = await forwardRequest(`${DEALER_SERVICE}/dealer/register`,"POST",req.body);
            res.json(result);
        }catch(err){
            res.status(err.status).json({ error: err.message });
        }
})

export default router;