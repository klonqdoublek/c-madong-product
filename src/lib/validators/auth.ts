import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  studentId: z
    .string()
    .regex(/^\d{10}$/, "Student ID must be 10 digits"),
  fullNameTh: z.string().min(1),
  fullNameEn: z.string().optional(),
  faculty: z.string().min(1, "กรุณากรอกคณะ"),
  email: z.email(),
  phone: z.string().optional(),
  lineUid: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().nullable(),
});

export const onboardingSchema = z.object({
  buildingId: z.string().uuid(),
  roomId: z.string().uuid(),
  bedId: z.string().uuid(),
  language: z.enum(["th", "en"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
