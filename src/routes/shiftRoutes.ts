import { ApiResponse } from "../utils/apiResponse.js";
import { ApiCode } from "../errors/apiCodes.js";
import {
    createShift,
    getAllShifts,
    getShiftFromId,
    deleteShift
} from '../services/shiftService.js'
import {
  createShiftSchema,
  shiftSchema
} from "../schemas/shift.schema.js";
import express from "express";
import { logError, logInfo } from "../utils/logger.js";
import { NotFoundError, ConflictError } from "../errors/apiError.js";
import type { Request, Response } from "express";
import { z } from "zod";

const router = express.Router();

router.get("", async (req: Request, res: Response) => {
  try {
    const shifts= await getAllShifts();
    return ApiResponse.success(res, ApiCode.FETCHED, shifts);
  } catch (error) {
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
});

router.post("", async (req: Request, res: Response) => {
  try {
    const parseBody = createShiftSchema.parse(req.body);
    const result = await createShift(parseBody);
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

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const params = { id: Number(req.params.id) };
    const { id } = shiftSchema.parse(params);
    const shift = await getShiftFromId(id);
    return ApiResponse.success(res, ApiCode.FETCHED, shift);
  } catch (error) {
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
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const params = { id: Number(req.params.id) };
    const { id } = shiftSchema.parse(params);
    const result = await deleteShift(id);
    return ApiResponse.success(res, ApiCode.DELETED, result);
  } catch (error) {
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
});

export default router;