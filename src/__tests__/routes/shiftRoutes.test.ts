import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ApiCode } from "../../errors/apiCodes.js";
import { NotFoundError, ConflictError } from "../../errors/apiError.js";
import { z } from "zod";
jest.unstable_mockModule("../../services/shiftService.js", () => ({
  getAllShifts: jest.fn(),
  createShift: jest.fn(),
  getShiftFromId: jest.fn(),
  deleteShift: jest.fn(),
}));

const shiftService = await import("../../services/shiftService.js");
const shiftRouter = (await import("../../routes/shiftRoutes.js")).default;

const app = express();
app.use(express.json());
app.use("/api/v1/shifts", shiftRouter);

const mockedService = shiftService as jest.Mocked<typeof shiftService>;

describe("shiftRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/shifts", () => {
    it("should return 200 and fetched data", async () => {
      const dummy = [
        {
          id: 1,
          shift_name: "Morning",
          start_time: new Date(),
          end_time: new Date(),
          shift_days: [],
          staffs: [],
        },
      ];
      mockedService.getAllShifts.mockResolvedValue(dummy);

      const response = await request(app).get("/api/v1/shifts");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.FETCHED.code);
      expect(response.body.data[0].id).toBe(dummy[0].id);
      expect(response.body.data[0].shift_name).toBe(dummy[0].shift_name);
      expect(new Date(response.body.data[0].start_time)).toEqual(
        dummy[0].start_time
      );
      expect(new Date(response.body.data[0].end_time)).toEqual(
        dummy[0].end_time
      );
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.getAllShifts.mockRejectedValue(
        new NotFoundError("No shifts")
      );

      const response = await request(app).get("/api/v1/shifts");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.getAllShifts.mockRejectedValue(new Error("DB down"));

      const response = await request(app).get("/api/v1/shifts");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      mockedService.getAllShifts.mockRejectedValue(
        new z.ZodError([
          {
            code: "custom",
            message: "Invalid attendance data",
            path: [],
          },
        ])
      );

      const response = await request(app).get("/api/v1/shifts");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });
  });

  describe("POST /api/v1/shifts", () => {
    const validBody = {
      shift_name: "Morning",
      start_time: "09:00",
      end_time: "17:00",
      shift_days: ["Mon", "Tue"],
    };

    it("should return 200 and created data", async () => {
      mockedService.createShift.mockResolvedValue({
        id: 1,
        shift_name: validBody.shift_name,
        start_time: new Date(),
        end_time: new Date(),
        shift_days: [],
      });

      const response = await request(app)
        .post("/api/v1/shifts")
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.CREATED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app).post("/api/v1/shifts").send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 409 when ConflictError is thrown", async () => {
      mockedService.createShift.mockRejectedValue(
        new ConflictError("Shift already exists")
      );

      const response = await request(app)
        .post("/api/v1/shifts")
        .send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.createShift.mockRejectedValue(new Error("DB failure"));

      const response = await request(app)
        .post("/api/v1/shifts")
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("GET /api/v1/shifts/:id", () => {
    it("should return 200 and fetched data", async () => {
      mockedService.getShiftFromId.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
        start_time: new Date(),
        end_time: new Date(),
        shift_days: [],
        staffs: [],
      });

      const response = await request(app).get("/api/v1/shifts/1");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.FETCHED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app).get("/api/v1/shifts/abc");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.getShiftFromId.mockRejectedValue(
        new NotFoundError("Missing")
      );

      const response = await request(app).get("/api/v1/shifts/99");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.getShiftFromId.mockRejectedValue(new Error("DB failure"));

      const response = await request(app).get("/api/v1/shifts/1");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("DELETE /api/v1/shifts/:id", () => {
    it("should return 200 and deleted data", async () => {
      mockedService.deleteShift.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
        start_time: new Date(),
        end_time: new Date(),
      });

      const response = await request(app).delete("/api/v1/shifts/1");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.DELETED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app).delete("/api/v1/shifts/not-a-number");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.deleteShift.mockRejectedValue(
        new NotFoundError("Shift not found")
      );

      const response = await request(app).delete("/api/v1/shifts/2");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.deleteShift.mockRejectedValue(new Error("DB failure"));

      const response = await request(app).delete("/api/v1/shifts/1");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });
});
