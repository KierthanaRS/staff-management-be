import { ApiResponse } from "../utils/apiResponse.js";
import { ApiCode } from "../errors/apiCodes.js";
import {
  createStaff,
  deleteStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
} from "../services/staffService.js";
import {
  createStaffSchema,
  staffSchema,
  updateStaffSchema,
} from "../schemas/staff.schema.js";
import express from "express";
import { logError, logInfo } from "../utils/logger.js";
import { NotFoundError, ConflictError } from "../errors/apiError.js";
import type { Request, Response } from "express";
import { z } from "zod";

const router = express.Router();

router.get("", async (req: Request, res: Response) => {
  try {
    const staffs = await getAllStaffs();
    return ApiResponse.success(res, ApiCode.FETCHED, staffs);
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
    const parseBody = createStaffSchema.parse(req.body);
    const result = await createStaff(parseBody);
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
    const { id } = staffSchema.parse(params);
    const staff = await getStaffById(id);
    return ApiResponse.success(res, ApiCode.FETCHED, staff);
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

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const params = Number(req.params.id) ;
    const data = { id: params, ...req.body };
    const parseBody = updateStaffSchema.parse(data);
    const result = await updateStaff(parseBody);
    return ApiResponse.success(res, ApiCode.UPDATED, result);
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

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const params = { id: Number(req.params.id) };
    const { id } = staffSchema.parse(params);
    const result = await deleteStaff(id);
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