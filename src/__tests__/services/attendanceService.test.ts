import { jest } from "@jest/globals";

jest.unstable_mockModule("../../lib/prisma.js", () => ({
  prisma: {
    attendance: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const { prisma } = await import("../../lib/prisma.js");
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const { checkIn, checkOut, getAttendance } = await import("../../services/attendanceService.js");

describe("attendanceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkIn", () => {
    it("should create an attendance record", async () => {
      const data = { staff_id: 1, check_in: new Date() };
      await checkIn(data);
    });

    it("should rethrow prisma errors", async () => {
      mockedPrisma.attendance.create.mockRejectedValue(new Error("fail"));
  
      await expect(checkIn({ staff_id: 1, check_in: new Date() }))
        .rejects.toThrow("fail");
    });

  });

  describe("checkOut", () => {
    it("should update an attendance record", async () => {
      const data = { attendance_id: 1, check_out: new Date() };
      await checkOut(data);
    });

    it("should rethrow prisma errors", async () => {
      mockedPrisma.attendance.update.mockRejectedValue(new Error("fail"));
  
      await expect(checkOut({ attendance_id: 1, check_out: new Date() }))
        .rejects.toThrow("fail");
    });
  });

  describe("getAttendance", () => {
    it("should return all attendance records", async () => {
      mockedPrisma.attendance.findMany.mockResolvedValue([{
        id: 1,
        staff_id: 1,
        check_in: new Date(),
        check_out: null,
      }]);
      const data = await getAttendance();
      expect(data).toBeDefined();
    });

    it("should rethrow prisma errors", async () => {
      mockedPrisma.attendance.findMany.mockRejectedValue(new Error("fail"));
  
      await expect(getAttendance())
        .rejects.toThrow("fail");
    });
    
  });

});