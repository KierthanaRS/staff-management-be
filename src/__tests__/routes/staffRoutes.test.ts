import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ApiCode } from "../../errors/apiCodes.js";
import { NotFoundError, ConflictError } from "../../errors/apiError.js";
import { staffs_role } from "../../../generated/prisma/enums.js";
import { z } from 'zod';

jest.unstable_mockModule("../../services/staffService.js", () => ({
  getAllStaffs: jest.fn(),
  createStaff: jest.fn(),
  getStaffById: jest.fn(),
  updateStaff: jest.fn(),
  deleteStaff: jest.fn(),
}));

const staffService = await import("../../services/staffService.js");
const staffRouter = (await import("../../routes/staffRoutes.js")).default;

const app = express();
app.use(express.json());
app.use("/api/v1/staffs", staffRouter);

const mockedService = staffService as jest.Mocked<typeof staffService>;

describe("staffRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/staffs", () => {
    it("should return 200 and fetched data", async () => {
      const dummy = [
        {
          id: 1,
          full_name: "John",
          email: "john@example.com",
          phone_number: "1234567890",
          shift_id: 1,
          active: true,
          role: staffs_role.Manager,
          shifts: { id: 1, shift_name: "Morning" },
        },
      ];
      mockedService.getAllStaffs.mockResolvedValue(dummy);

      const response = await request(app).get("/api/v1/staffs");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.FETCHED.code);
      expect(response.body.data).toEqual(dummy);
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.getAllStaffs.mockRejectedValue(new NotFoundError("No staffs"));

      const response = await request(app).get("/api/v1/staffs");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.getAllStaffs.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).get("/api/v1/staffs");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      mockedService.getAllStaffs.mockRejectedValue(
        new z.ZodError([
          {
            code: "custom",
            message: "Invalid attendance data",
            path: []
          }
        ])
      );
    
      const response = await request(app).get("/api/v1/staffs");
    
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });
    
  });

  describe("POST /api/v1/staffs", () => {
    const validBody = {
      full_name: "John Doe",
      email: "john@example.com",
      phone_number: "1234567890",
      shift_id: 1,
      staffs_role: staffs_role.Manager,
    };

    it("should return 200 and created data", async () => {
      mockedService.createStaff.mockResolvedValue({
        id: 1,
        shift_id: validBody.shift_id,
        active: true,
        full_name: validBody.full_name,
        email: validBody.email,
        phone_number: validBody.phone_number,
        role: validBody.staffs_role,
      });

      const response = await request(app).post("/api/v1/staffs").send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.CREATED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app).post("/api/v1/staffs").send({ name: 123 });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 409 when ConflictError is thrown", async () => {
      mockedService.createStaff.mockRejectedValue(
        new ConflictError("Duplicate email")
      );

      const response = await request(app).post("/api/v1/staffs").send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.createStaff.mockRejectedValue(new Error("Unexpected"));

      const response = await request(app).post("/api/v1/staffs").send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("GET /api/v1/staffs/:id", () => {
    it("should return 200 and fetched data", async () => {
      mockedService.getStaffById.mockResolvedValue({
        id: 1,
        full_name: "John",
        email: "john@example.com",
        phone_number: "1234567890",
        shift_id: 1,
        active: true,
        role: staffs_role.Manager,
      });

      const response = await request(app).get("/api/v1/staffs/1");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.FETCHED.code);
    });

    it("should return 400 when Zod validation error is thrown", async () => {
      const response = await request(app).get("/api/v1/staffs/abc");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 404 when NotFoundError is thrown", async () => {
      mockedService.getStaffById.mockRejectedValue(new NotFoundError("Missing"));

      const response = await request(app).get("/api/v1/staffs/99");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.getStaffById.mockRejectedValue(new Error("DB failure"));

      const response = await request(app).get("/api/v1/staffs/1");
      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("PUT /api/v1/staffs/:id", () => {
    const updateBody = {
      full_name: "Jane Doe",
      email: "jane@example.com",
      phone_number: "9999999999",
      shift_id: 2,
      staffs_role: staffs_role.Cashier,
    };

    it("should return 200 on success", async () => {
      mockedService.updateStaff.mockResolvedValue({
        id: 1,
        shift_id: updateBody.shift_id,
        active: true,
        full_name: updateBody.full_name,
        email: updateBody.email,
        phone_number: updateBody.phone_number,
        role: updateBody.staffs_role,
      });

      const response = await request(app)
        .put("/api/v1/staffs/1")
        .send(updateBody);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.UPDATED.code);
    });

    it("should return 400 on Zod validation error", async () => {
      const response = await request(app).put("/api/v1/staffs/one").send(updateBody);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 404 when not found", async () => {
      mockedService.updateStaff.mockRejectedValue(new NotFoundError("Missing"));

      const response = await request(app).put("/api/v1/staffs/5").send(updateBody);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.updateStaff.mockRejectedValue(new Error("Unexpected"));

      const response = await request(app).put("/api/v1/staffs/1").send(updateBody);

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });

  describe("DELETE /api/v1/staffs/:id", () => {
    it("should return 200 on success", async () => {
      mockedService.deleteStaff.mockResolvedValue({
        id: 1,
        full_name: "John",
        email: "john@example.com",
        phone_number: "1234567890",
        shift_id: 1,
        active: null,
        role: staffs_role.Manager,
      });

      const response = await request(app).delete("/api/v1/staffs/1");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(ApiCode.DELETED.code);
    });

    it("should return 400 on invalid params", async () => {
      const response = await request(app).delete("/api/v1/staffs/bad");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ApiCode.VALIDATION_ERROR.code);
    });

    it("should return 404 when not found", async () => {
      mockedService.deleteStaff.mockRejectedValue(new NotFoundError("Missing"));

      const response = await request(app).delete("/api/v1/staffs/77");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ApiCode.NOT_FOUND.code);
    });

    it("should return 500 on unknown errors", async () => {
      mockedService.deleteStaff.mockRejectedValue(new Error("DB error"));

      const response = await request(app).delete("/api/v1/staffs/1");

      expect(response.status).toBe(500);
      expect(response.body.code).toBe(ApiCode.INTERNAL_ERROR.code);
    });
  });
});

