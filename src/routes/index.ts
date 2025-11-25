import express from "express";
import attendanceRouter from './attendanceRoutes'
import shiftRouter from './shiftRoutes.js'
import staffRouter from "./staffRoutes.js";
const router = express.Router();

router.use('/attendance',attendanceRouter)
router.use('/shift',shiftRouter)
router.use('/staff',staffRouter)

export default router;