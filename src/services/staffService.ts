import { NotFoundError, ConflictError } from "../errors/apiError.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../schemas/staff.schema.js";

export const createStaff = async (data: CreateStaffInput) => {
  const { full_name, email, phone_number, shift_id, staffs_role } = data;
  const exsisting = await prisma.staffs.findFirst({
    where: { full_name, email },
  });
  if (exsisting)
    throw new ConflictError(
      `Staff with name ${full_name} and email: ${email} already exsist`
    );

  return await prisma.staffs.create({
    data: {
      full_name,
      email,
      phone_number,
      shift_id,
      role: staffs_role,
      active: true,
    },
  });
};

export const getAllStaffs = async () => {
  return await prisma.staffs.findMany({
    where: { active: true },
    include: {
      shifts: {
        select: {
          shift_name: true,
        },
      },
    },
  });
};

export const getStaffById = async (id: number) => {
  const staff = await prisma.staffs.findUnique({ where: { id } });
  if (!staff) throw new NotFoundError(`staff with id ${id} not found`);
  return staff;
};

export const updateStaff = async (data: UpdateStaffInput) => {
  const { id, full_name, email, phone_number, shift_id, staffs_role } = data;
  const staff = await prisma.staffs.findUnique({ where: { id } });
  if (!staff) throw new NotFoundError(`staff with id ${id} not found`);
  return await prisma.staffs.update({
    where: { id },
    data: {
      ...(full_name && { full_name }),
      ...(email && { email }),
      ...(phone_number && { phone_number }),
      ...(shift_id !== undefined && { shift_id }),
      ...(staffs_role && { role: staffs_role }),
    },
  });
};

export const deleteStaff = async (id: number) => {
  const staff = await prisma.staffs.findUnique({ where: { id } });
  if (!staff) throw new NotFoundError(`staff with id ${id} not found`);
  return await prisma.staffs.update({
    where: { id },
    data: {
      active: false,
    },
  });
};
