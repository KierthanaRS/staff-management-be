import { ApiResponse } from "../utils/apiResponse.js";
import { ApiCode } from "../errors/apiCodes.js";
import { checkIn, checkOut, getAttendance } from "../services/attendanceService.js";
import {
  createCheckIn,
  createCheckOut,
} from "../schemas/attendance.schema.js";
import express from "express";
import { logError } from "../utils/logger.js";
import {  NotFoundError, ConflictError } from "../errors/apiError.js";
import type { Request, Response } from "express";
import { z } from "zod";

const router = express.Router();

router.post("/checkIn", async (req: Request, res: Response) => {
  try {
    const parseBody = createCheckIn.parse(req.body);
    const result = await checkIn(parseBody);
    return ApiResponse.success(res, ApiCode.CREATED, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.error(
        res,
        400,
        ApiCode.VALIDATION_ERROR,
        error.issues.map((i) => i.message)
      );
    }
     if (error instanceof ConflictError) {
      return ApiResponse.error(res, 409, ApiCode.VALIDATION_ERROR, error.message);
    }

    logError(
      `Error fetching item: ${error instanceof Error ? error.message : error}`
    );
    return ApiResponse.error(
      res,
      500,
      ApiCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : undefined
    );
  }
});

router.post("/checkOut", async (req: Request, res: Response) => {
  try {
    const parseBody = createCheckOut.parse(req.body);
    const result = await checkOut(parseBody);
    return ApiResponse.success(res, ApiCode.CREATED, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.error(
        res,
        400,
        ApiCode.VALIDATION_ERROR,
        error.issues.map((i) => i.message)
      );
    }
     if (error instanceof ConflictError) {
      return ApiResponse.error(res, 409, ApiCode.VALIDATION_ERROR, error.message);
    }

    logError(
      `Error fetching item: ${error instanceof Error ? error.message : error}`
    );
    return ApiResponse.error(
      res,
      500,
      ApiCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : undefined
    );
  }
});

router.get("", async (req: Request, res: Response) => {
  try{
    const attendance = await getAttendance();
    return ApiResponse.success(res, ApiCode.FETCHED, attendance);
  }
  catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.error(
          res,
          400,
          ApiCode.VALIDATION_ERROR,
          error.issues.map((i) => i.message)
        );
      }
      if (error instanceof NotFoundError) {
        return ApiResponse.error(res, 404, ApiCode.NOT_FOUND, error.message);
      }
  
      logError(
        `Error fetching item: ${error instanceof Error ? error.message : error}`
      );
      return ApiResponse.error(
        res,
        500,
        ApiCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : undefined
      );
    }
})

export default router