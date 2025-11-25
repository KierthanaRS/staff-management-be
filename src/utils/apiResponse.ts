import type { Response } from "express";
import { ApiCode } from "../errors/apiCodes.js";

export class ApiResponse {
  static success<T>(res: Response, apiCode: ApiCode, data?: T) {
    return res.status(200).json({
      success: true,
      code: apiCode.code,
      message: apiCode.message,
      data,
    });
  }

  static error(res: Response, httpStatus: number, apiCode: ApiCode, details?: unknown) {
    return res.status(httpStatus).json({
      success: false,
      code: apiCode.code,
      message: apiCode.message,
      details,
    });
  }
}