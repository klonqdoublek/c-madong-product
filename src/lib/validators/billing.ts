import { z } from "zod/v4";

export const billItemSchema = z.object({
  label: z.string().min(1, "กรุณากรอกรายการ"),
  category: z.enum(["room", "electricity", "water", "deposit", "fine", "other"]),
  amount: z.number().min(0, "จำนวนเงินต้องไม่ติดลบ"),
  notes: z.string().optional(),
});

export const createBillSchema = z.object({
  studentId: z.string().uuid(),
  buildingId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  bedId: z.string().uuid().optional(),
  billingMonth: z.number().int().min(1).max(12),
  billingYear: z.number().int().min(2000),
  billingRound: z.number().int().min(1).default(1),
  dueDate: z.string().min(1, "กรุณาเลือกวันครบกำหนด"),
  adminNotes: z.string().optional(),
  items: z.array(billItemSchema).min(1, "ต้องมีรายการอย่างน้อย 1 รายการ"),
  sendLineReminder: z.boolean().default(false),
});

export const updateBillStatusSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
  adminNotes: z.string().optional(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillStatusInput = z.infer<typeof updateBillStatusSchema>;
export type BillItemInput = z.infer<typeof billItemSchema>;
