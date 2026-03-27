import { z } from "zod/v4";
import { MAINTENANCE_CATEGORIES } from "@/lib/utils/constants";

export const maintenanceRequestSchema = z.object({
  category: z.enum(MAINTENANCE_CATEGORIES),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  photos: z.array(z.string()).max(5).optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  ai_confidence: z.number().min(0).max(1).optional(),
  ai_provider: z.string().optional(),
  template_id: z.string().optional(),
  damage_details: z.string().optional(),
});

export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
