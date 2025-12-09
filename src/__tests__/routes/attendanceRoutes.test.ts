  import { jest } from "@jest/globals";
  import request from "supertest";
  import express from "express";
  import { ApiCode } from "../../errors/apiCodes.js";
  import { NotFoundError, ConflictError } from "../../errors/apiError.js";
  import { z } from 'zod'

jest.unstable_mockModule("../../services/attendanceService.js", () => ({
  getAttendance: jest.fn(),
  checkIn: jest.fn(),
  checkOut: jest.fn(),
}));

const attendanceService = await import("../../services/attendanceService.js");
const attendanceRouter = (await import("../../routes/attendanceRoutes.js")).default;

const app = express();
app.use(express.json());
app.use("/api/v1/attendance", attendanceRouter);

const mockedService = attendanceService as jest.Mocked<typeof attendanceService>;

describe("attendanceRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/attendance", () => {
    it("should return 200 and fetched data", async () => {
      const dummy = [
        {
          id: 1,
          staff_id: 1,
          check_in: new Date(),
          check_out: null,
        },
      ];

      mockedService.getAttendance.mockResolvedValue(dummy);

      const response = await request(app).get("/api/v1/attendance");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.FETCHED.code);
      expect(response.body.data[0].id).toBe(dummy[0].id);
      expect(response.body.data[0].staff_id).toBe(dummy[0].staff_id);
      expect(new Date(response.body.data[0].check_in)).toEqual(dummy[0].check_in);
      expect(response.body.data[0].check_out).toBeNull();
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.getAttendance.mockRejectedValue(new NotFoundError("No data"));

      const response = await request(app).get("/api/v1/attendance");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.getAttendance.mockRejectedValue(new Error("DB crashed"));

      const response = await request(app).get("/api/v1/attendance");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      mockedService.getAttendance.mockRejectedValue(
        new z.ZodError([
          {
            code: "custom",
            message: "Invalid attendance data",
            path: []
          }
        ])
      );
    
      const response = await request(app).get("/api/v1/attendance");
    
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });    
  });

  describe("POST /api/v1/attendance/checkIn", () => {
    const validBody = {
      staff_id: 1,
      shift_id: 1,
      check_in: new Date().toISOString(),
    };

    it("should return 200 and created data", async () => {
      mockedService.checkIn.mockResolvedValue({
        id: 1,
        staff_id: 1,
        check_in: new Date(),
        check_out: null,
      });

      const response = await request(app)
        .post("/api/v1/attendance/checkIn")
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.CREATED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app)
        .post("/api/v1/attendance/checkIn")
        .send({ staff_id: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 409 when ConflictError is thrown", async () => {
      mockedService.checkIn.mockRejectedValue(
        new ConflictError("Already checked in")
      );

      const response = await request(app)
        .post("/api/v1/attendance/checkIn")
        .send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.checkIn.mockRejectedValue(new Error("Unknown failure"));

      const response = await request(app)
        .post("/api/v1/attendance/checkIn")
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("POST /api/v1/attendance/checkOut", () => {
    const validBody = {
      attendance_id: 1,
      check_out: new Date().toISOString(),
    };

    it("should return 200 and created data", async () => {
      mockedService.checkOut.mockResolvedValue({
        id: 1,
        staff_id: 1,
        check_in: new Date(),
        check_out: new Date(),
      });

      const response = await request(app)
        .post("/api/v1/attendance/checkOut")
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.CREATED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app)
        .post("/api/v1/attendance/checkOut")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 409 when ConflictError is thrown", async () => {
      mockedService.checkOut.mockRejectedValue(
        new ConflictError("Already checked out")
      );

      const response = await request(app)
        .post("/api/v1/attendance/checkOut")
        .send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.checkOut.mockRejectedValue(new Error("DB failure"));

      const response = await request(app)
        .post("/api/v1/attendance/checkOut")
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });
});
