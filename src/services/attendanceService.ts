
import { prisma } from "../lib/prisma.js";
import type {
  createCheckInInput,
  CreateCheckOutInput
} from "../schemas/attendance.schema.js";

export const checkIn = async (data: createCheckInInput) => {
  const { staff_id, check_in } = data;
  

  return await prisma.attendance.create({
    data: {
      staff_id,
      check_in,
    },
  });
};

export const checkOut = async (data: CreateCheckOutInput) => {
  const { attendance_id, check_out } = data;

  return await prisma.attendance.update({
    where: { id: attendance_id },
    data: {
      check_out,
    },
  });
};

export const getAttendance = async () => {
  return await prisma.attendance.findMany({
    where: {
      check_out: null
    }
  });
};
