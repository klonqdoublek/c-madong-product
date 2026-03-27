import { z } from "zod/v4";
import { TECHNICIAN_SPECIALTIES } from "@/lib/utils/constants";

export const updateTicketSchema = z.object({
  status: z.enum(["pending", "acknowledged", "in_progress", "completed", "cancelled"]).optional(),
  technician_id: z.string().uuid().nullable().optional(),
  admin_notes: z.string().max(2000).nullable().optional(),
  failure_reason: z.string().max(500).nullable().optional(),
  ai_feedback: z.enum(["incorrect", "correct"]).optional(),
  correct_category: z.string().optional(),
});

export const createTechnicianSchema = z.object({
  display_name: z.string().min(1).max(200),
  specialty: z.enum(TECHNICIAN_SPECIALTIES),
  line_user_id: z.string().max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const updateTechnicianSchema = createTechnicianSchema.partial();

export const bookAppointmentSchema = z.object({
  ticket_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
