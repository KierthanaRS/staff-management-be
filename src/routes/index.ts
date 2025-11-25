import express from "express";
import staffRouter from "./staffRoutes.js";
import shiftRouter from './shiftRoutes.js'
const router = express.Router();

router.use('/staff',staffRouter)
router.use('/shift',shiftRouter)

export default router;