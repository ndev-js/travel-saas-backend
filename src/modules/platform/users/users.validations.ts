import { UserRole } from "@/generated/prisma/enums";
import { z } from "zod";

export const tenantUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional().default(true),
});

export type TenantUserCreationInput = z.infer<typeof tenantUserSchema>;
export const tenantIdParamSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant id"),
});