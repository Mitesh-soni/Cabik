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

// Fetch dealer by id
router.get("/:id", async (req, res) => {
    try {
        const result = await forwardRequest(`${DEALER_SERVICE}/dealer/${req.params.id}`, "GET");
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

export default router;