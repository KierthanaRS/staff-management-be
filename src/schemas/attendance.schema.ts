import { z } from 'zod';


export const createCheckIn = z.object({
  staff_id : z.number().int().positive(),
  check_in: z.date(),
});

export const createCheckOut = z.object({
  attendance_id: z.number().int().positive(),
  check_out: z.date(),
});

export type createCheckInInput= z.infer<typeof createCheckIn>;
export type CreateCheckOutInput = z.infer<typeof createCheckOut>;