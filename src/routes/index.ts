import express from "express";
import shiftRouter from './shiftRoutes.js'
const router = express.Router();

router.use('/shift',shiftRouter)

export default router;