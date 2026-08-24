import { TenantPlan, TenantStatus } from "@/generated/prisma/enums";
import z from "zod";

export const createTenantSchema = z.object({
    name:z.string().trim().min(3,"name is required"),
    subDomain:z.string().trim().min(10,"subdomain is required"),
    plan: z.enum([TenantPlan.free,TenantPlan.enterprice,TenantPlan.pro,TenantPlan.starter]),
    status:z.enum([TenantStatus.active,TenantStatus.cancelled,TenantStatus.suspended]),
    logoUrl:z.string().trim().optional()
})