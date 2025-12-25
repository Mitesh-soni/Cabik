import express from "express";
import { forwardRequest } from "../utils/serviceCaller.js";
import { DEALER_SERVICE } from "../services/service.js";

const router = express.Router();

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