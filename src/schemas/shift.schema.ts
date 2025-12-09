import { z } from 'zod';

const allowedDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;
export type AllowedDays = (typeof allowedDays)[number];
export const createShiftSchema = z.object({
  shift_name: z.string().min(1, 'Shift name is required'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  shift_days: z.array(z.enum(allowedDays)).min(1, "Shift days are required")
});

export const shiftSchema = z.object({
    id : z.number().int().positive()
})
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
