import { jest } from "@jest/globals";
import { AllowedDays } from "../../schemas/shift.schema";
import { CreateShiftInput } from "../../schemas/shift.schema";
import {
  ConflictError,
  ValidationError,
} from "../../errors/apiError";

jest.unstable_mockModule("../../lib/prisma.js", () => ({
  prisma: {
    shifts: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    shift_days: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../lib/prisma.js");
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const { createShift, getAllShifts, getShiftFromId, deleteShift } = await import(
  "../../services/shiftService.js"
);

describe("shiftService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createShift", () => {
    it("should create a shift", async () => {
      const data: CreateShiftInput = {
        shift_name: "Morning",
        start_time: "09:00",
        end_time: "17:00",
        shift_days: [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ] as AllowedDays[],
      };

      mockedPrisma.shifts.findFirst.mockResolvedValue(null);

      mockedPrisma.shifts.create.mockResolvedValue({
        id: 100,
        shift_name: data.shift_name,
        start_time: new Date(`1970-01-01T09:00:00`),
        end_time: new Date(`1970-01-01T17:00:00`),
      });

      mockedPrisma.shift_days.createMany.mockResolvedValue({ count: 7 });

      mockedPrisma.shifts.findUnique.mockResolvedValue({
        id: 100,
        shift_name: data.shift_name,
        start_time: new Date(`1970-01-01T09:00:00`),
        end_time: new Date(`1970-01-01T17:00:00`),
        shift_days: data.shift_days.map((day) => ({ day })),
      } as any);

      const shift = await createShift(data);

      expect(mockedPrisma.shifts.create).toHaveBeenCalledWith({
        data: {
          shift_name: data.shift_name,
          start_time: new Date(`1970-01-01T${data.start_time}:00`),
          end_time: new Date(`1970-01-01T${data.end_time}:00`),
        },
      });

      expect(mockedPrisma.shift_days.createMany).toHaveBeenCalled();
      expect(shift).toEqual({
        id: 100,
        shift_name: data.shift_name,
        start_time: new Date(`1970-01-01T09:00:00`),
        end_time: new Date(`1970-01-01T17:00:00`),
        shift_days: data.shift_days.map((day) => ({ day })),
      } as any);
    });

    it("should throw ValidationError for invalid start_time", async () => {
      const data: CreateShiftInput = {
        shift_name: "Morning",
        start_time: "25:00",
        end_time: "17:00",
        shift_days: ["Mon"] as AllowedDays[],
      };

      await expect(createShift(data)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid end_time", async () => {
      const data: CreateShiftInput = {
        shift_name: "Morning",
        start_time: "09:00",
        end_time: "99:00",
        shift_days: ["Mon"] as AllowedDays[],
      };

      await expect(createShift(data)).rejects.toThrow(ValidationError);
    });

    it("should throw a ConflictError if shift name already exists", async () => {
      const data: CreateShiftInput = {
        shift_name: "Morning",
        start_time: "09:00",
        end_time: "17:00",
        shift_days: ["Mon", "Tue"] as AllowedDays[],
      };

      mockedPrisma.shifts.findFirst.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
        start_time: new Date(),
        end_time: new Date(),
      } as any);

      await expect(createShift(data)).rejects.toThrow(ConflictError);
      expect(mockedPrisma.shifts.create).not.toHaveBeenCalled();
    });
  });

  describe("getAllShifts", () => {
    it("should return all shifts", async () => {
      mockedPrisma.shifts.findMany.mockResolvedValue([
        {
          id: 1,
          shift_name: "Morning",
          start_time: new Date(),
          end_time: new Date(),
          shift_days: [],
        } as any,
      ]);
      const shifts = await getAllShifts();
      expect(shifts).toEqual([
        {
          id: 1,
          shift_name: "Morning",
          start_time: new Date(),
          end_time: new Date(),
          shift_days: [],
        } as any,
      ]);
      expect(mockedPrisma.shifts.findMany).toHaveBeenCalled();
    });
  });

  describe("getShiftFromId", () => {
    it("should return a shift by id", async () => {
      const now = new Date();
  
      mockedPrisma.shifts.findUnique.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
        start_time: now,
        end_time: now,
        shift_days: [{ day: "Mon" }],
        staffs: [
          {
            id: 10,
            full_name: "John Doe",
            email: "john@example.com",
            phone_number: "1234567890",
            role: "Worker",
          },
        ],
      } as any);
  
      const shift = await getShiftFromId(1);
  
      expect(mockedPrisma.shifts.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          staffs: {
            where: { active: true },
            select: {
              id: true,
              full_name: true,
              email: true,
              phone_number: true,
              role: true,
            },
          },
          shift_days: {
            select: { day: true },
          },
        },
      });
  
      expect(shift.id).toBe(1);
      expect(shift.shift_name).toBe("Morning");
      expect(shift.shift_days).toEqual([{ day: "Mon" }]);
      expect(shift.staffs.length).toBe(1);
    });
  
    it("should throw NotFoundError if shift does not exist", async () => {
      mockedPrisma.shifts.findUnique.mockResolvedValue(null);
  
      await expect(getShiftFromId(99))
        .rejects
        .toThrow("Shift with id 99 not found");
  
      expect(mockedPrisma.shifts.findUnique).toHaveBeenCalled();
    });
  
    it("should rethrow Prisma errors", async () => {
      mockedPrisma.shifts.findUnique.mockRejectedValue(new Error("DB failure"));
  
      await expect(getShiftFromId(1))
        .rejects
        .toThrow("DB failure");
    });
  });
  
  describe("deleteShift", () => {
    it("should delete a shift", async () => {
      mockedPrisma.shifts.findUnique.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
      } as any);
    
      mockedPrisma.shifts.delete.mockResolvedValue({
        id: 1,
        shift_name: "Morning",
      } as any);
    
      const result = await deleteShift(1);
    
      expect(mockedPrisma.shifts.findUnique).toHaveBeenCalledWith({where: { id: 1 }});
    
      expect(mockedPrisma.shifts.delete).toHaveBeenCalledWith({where: { id: 1 }});
    
      expect(result.id).toBe(1);
    });
    

    it("should rethrow prisma errors", async () => {
      mockedPrisma.shifts.delete.mockRejectedValue(new Error("fail"));
      await expect(deleteShift(1)).rejects.toThrow("fail");
    });

    it("should throw NotFoundError if shift not found", async () => {
      mockedPrisma.shifts.findUnique.mockResolvedValue(null);

      await expect(deleteShift(1)).rejects.toThrow("Shift with id 1 not found");

      expect(mockedPrisma.shifts.delete).not.toHaveBeenCalled();
    });
  });
});
