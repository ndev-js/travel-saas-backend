import { PlatformRole } from "@/generated/prisma/enums";
import { z } from "zod";

export const platformAdminSignUpSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([PlatformRole.SUPER_ADMIN, PlatformRole.SUPPORT, PlatformRole.BILLING_ADMIN]),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
