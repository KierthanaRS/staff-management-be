import { jest } from "@jest/globals";
import {
  ConflictError,
  ValidationError,
} from "../../errors/apiError";

jest.unstable_mockModule("../../lib/prisma.js", () => ({
  prisma: {
    staffs: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
  },
}));

const { prisma } = await import("../../lib/prisma.js");
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const { createStaff,getAllStaffs, getStaffById, updateStaff, deleteStaff  }  = await import("../../services/staffService");

describe("staffService",()=>{
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createStaff", () => {
    it("should create a staff successfully", async () => {
      const data = {
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "1234567890",
        shift_id: 1,
        staffs_role: "Chef" as any,
      };
  
      mockedPrisma.staffs.findFirst.mockResolvedValue(null);
  
      mockedPrisma.staffs.create.mockResolvedValue({
        id: 10,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        shift_id: data.shift_id,
        role: data.staffs_role,
        active: true,
      } as any);
  
      const staff = await createStaff(data);
  
      expect(mockedPrisma.staffs.findFirst).toHaveBeenCalledWith({
        where: { full_name: data.full_name, email: data.email, active: true },
      });
  
      expect(mockedPrisma.staffs.create).toHaveBeenCalledWith({
        data: {
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          shift_id: data.shift_id,
          role: data.staffs_role,
          active: true,
        },
      });
  
      expect(staff.id).toBe(10);
    });
  
    it("should throw ConflictError if staff already exists", async () => {
      const data = {
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "1234567890",
        shift_id: 1,
        staffs_role: "Chef" as any,
      };
  
      mockedPrisma.staffs.findFirst.mockResolvedValue({
        id: 1,
        full_name: data.full_name,
        email: data.email,
      } as any);
  
      await expect(createStaff(data)).rejects.toThrow(ConflictError);
  
      expect(mockedPrisma.staffs.create).not.toHaveBeenCalled();
    });
  
    it("should rethrow prisma errors", async () => {
      const data = {
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "1234567890",
        shift_id: 1,
        staffs_role: "Chef" as any,
      };
  
      mockedPrisma.staffs.findFirst.mockResolvedValue(null); 
  
      mockedPrisma.staffs.create.mockRejectedValue(new Error("DB failed"));
  
      await expect(createStaff(data)).rejects.toThrow("DB failed");
    });
  });
  
  describe("getAllStaffs", () => {
    it("should return all active staffs", async () => {  
      mockedPrisma.staffs.findMany.mockResolvedValue([
        {
          id: 1,
          full_name: "John Doe",
          email: "john@example.com",
          phone_number: "1234567890",
          role: "Chef",
          shift_id: 1,
          active: true,
          shifts: {
            id: 1,
            shift_name: "Morning",
          },
        } as any,
      ]);
  
      const staffs = await getAllStaffs();
  
      expect(mockedPrisma.staffs.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: {
          shifts: {
            select: {
              id: true,
              shift_name: true,
            },
          },
        },
      });
  
      expect(staffs.length).toBe(1);
      expect(staffs[0].full_name).toBe("John Doe");
      expect(staffs[0]?.shifts?.shift_name).toBe("Morning");
    });
  
    it("should return an empty array if no staffs exist", async () => {
      mockedPrisma.staffs.findMany.mockResolvedValue([]);
  
      const staffs = await getAllStaffs();
  
      expect(staffs).toEqual([]);
    });
  
    it("should rethrow prisma errors", async () => {
      mockedPrisma.staffs.findMany.mockRejectedValue(new Error("Database error"));
  
      await expect(getAllStaffs()).rejects.toThrow("Database error");
    });
  });
  
  describe("getStaffById", () => {
    it("should return a staff by id", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue({
        id: 1,
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "123",
        shift_id: 1,
        role: "Worker",
        active: true,
      } as any);
  
      const staff = await getStaffById(1);
  
      expect(mockedPrisma.staffs.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
  
      expect(staff.id).toBe(1);
    });
  
    it("should throw NotFoundError if staff does not exist", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue(null);
  
      await expect(getStaffById(999))
        .rejects
        .toThrow("staff with id 999 not found");
    });
  
    it("should rethrow prisma errors", async () => {
      mockedPrisma.staffs.findUnique.mockRejectedValue(new Error("DB error"));
  
      await expect(getStaffById(1))
        .rejects
        .toThrow("DB error");
    });
  });

  describe("updateStaff", () => {
    it("should update staff fields", async () => {
      const data = {
        id: 1,
        full_name: "John Updated",
        email: "updated@example.com",
        phone_number: "999",
        shift_id: 2,
        staffs_role: "Manager" as any, 
      };
  
      // staff exists
      mockedPrisma.staffs.findUnique.mockResolvedValue({ id: 1 } as any);
  
      // prisma update result
      mockedPrisma.staffs.update.mockResolvedValue({
        id: 1,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        shift_id: data.shift_id,
        role: data.staffs_role,
      } as any);
  
      const staff = await updateStaff(data);
  
      expect(mockedPrisma.staffs.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
  
      expect(mockedPrisma.staffs.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          shift_id: data.shift_id,
          role: data.staffs_role,
        },
      });
  
      expect(staff.full_name).toBe("John Updated");
    });
  
    it("should throw NotFoundError if staff does not exist", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue(null);
  
      await expect(updateStaff({ id: 999 }))
        .rejects
        .toThrow("staff with id 999 not found");
  
      expect(mockedPrisma.staffs.update).not.toHaveBeenCalled();
    });
  
    it("should rethrow prisma errors", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue({ id: 1 } as any);
      mockedPrisma.staffs.update.mockRejectedValue(new Error("DB error"));
  
      await expect(updateStaff({ id: 1 }))
        .rejects
        .toThrow("DB error");
    });
  });
  
  describe("deleteStaff", () => {
    it("should soft delete staff", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue({
        id: 1,
        active: true,
      } as any);
  
      mockedPrisma.staffs.update.mockResolvedValue({
        id: 1,
        active: false,
      } as any);
  
      const result = await deleteStaff(1);
  
      expect(mockedPrisma.staffs.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
  
      expect(mockedPrisma.staffs.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
  
      expect(result.active).toBe(false);
    });
  
    it("should throw NotFoundError if staff does not exist", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue(null);
  
      await expect(deleteStaff(1))
        .rejects
        .toThrow("staff with id 1 not found");
  
      expect(mockedPrisma.staffs.update).not.toHaveBeenCalled();
    });
  
    it("should rethrow prisma errors", async () => {
      mockedPrisma.staffs.findUnique.mockResolvedValue({ id: 1 } as any);
  
      mockedPrisma.staffs.update.mockRejectedValue(new Error("DB error"));
  
      await expect(deleteStaff(1))
        .rejects
        .toThrow("DB error");
    });
  });
  
})