import { prisma } from "@/lib/prisma";
import { TenantCreateReq } from "./tenants.types";

export class TenantService {
  async createTenant(data: TenantCreateReq) {
    const { name, logoUrl, subDomain, plan, status } = data;
    const tenant = await prisma.tenant.create({
      data: {
        name,
        logoUrl,
        subDomain,
        plan,
        status,
      },
      select: {
        id: true,
        name: true,
        subDomain: true,
        plan: true,
        status: true,
      },
    });
    return tenant
  }

  async getTenants () {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subDomain: true,
        plan: true,
        status: true,
      },
    });
    return tenants
  }
}
