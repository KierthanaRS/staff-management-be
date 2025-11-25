import { staffs_role } from "../../generated/prisma/client.js";
import { z } from "zod";

export const StaffRoleEnum = z.nativeEnum(staffs_role);

export const createStaffSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z.string().length(10, "Phone number must be exactly 10 digits"),
  shift_id: z.number().int().positive(),
  staffs_role: StaffRoleEnum,
});

export const updateStaffSchema = z.object({
  id: z.number().int().positive(),
  full_name: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  phone_number: z.string().length(10).optional(),
  shift_id: z.number().int().positive().optional(),
  staffs_role: StaffRoleEnum.optional(),
});

export const staffSchema = z.object({
   id: z.number().int().positive()
})
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
