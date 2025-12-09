import { NotFoundError, ConflictError, ValidationError } from "../errors/apiError.js";
import { prisma } from "../lib/prisma.js";
import type { CreateShiftInput } from "../schemas/shift.schema.js";


export const createShift = async (data: CreateShiftInput) => {
  const { shift_name, start_time, end_time, shift_days } = data;
  const existing = await prisma.shifts.findFirst({ where: { shift_name } });
  if (existing)
    throw new ConflictError(`Shift with name ${shift_name} already exists`);
  const startTimeObj = new Date(`1970-01-01T${start_time}:00`);
  const endTimeObj = new Date(`1970-01-01T${end_time}:00`);
  if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
    throw new ValidationError("Invalid start_time or end_time");
  }
  const shift = await prisma.shifts.create({
    data: {
      shift_name,
      start_time: startTimeObj,
      end_time: endTimeObj,
    },
  });
 const shiftDaysData = shift_days.map(day => ({
    shift_id: shift.id,
    day,
  }));

  await prisma.shift_days.createMany({
    data: shiftDaysData,
  });
  const fullShift = await prisma.shifts.findUnique({
    where: { id: shift.id },
    include: {
      shift_days: {
        select: { day: true },
      },
    },
  });

  return fullShift;
};

export const getAllShifts = async () => {
  return await prisma.shifts.findMany({
    include: {
      shift_days: {
        select:{
            day: true
        }
      }, 
    },
  });
};

export const getShiftFromId = async (id: number) => {
  const shift = await prisma.shifts.findUnique({
    where: { id },
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
      shift_days : {
        select:{
          day: true
        }
      }
    },
  });
  if (!shift) throw new NotFoundError(`Shift with id ${id} not found`);
  return shift;
};

export const deleteShift = async (id: number) => {
  const shift = await prisma.shifts.findUnique({ where: { id } });
  if (!shift) throw new NotFoundError(`Shift with id ${id} not found`);

  return await prisma.shifts.delete({ where: { id } });
};
