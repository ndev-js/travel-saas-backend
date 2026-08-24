import { TenantPlan, TenantStatus } from "@/generated/prisma/enums"



interface TenantCreateReq {
    name: string
    subDomain: string
    plan: TenantPlan
    status: TenantStatus
    logoUrl?: string
}

export {TenantCreateReq}