import express from "express";
import { purchaseOrder } from "";

const router = express.Router();

router.post("/purchaseOrder", purchaseOrder);
router.post("/login", login);

export default router;