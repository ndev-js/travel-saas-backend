import { prisma } from "@/lib/prisma";
import { TenantCreateReq } from "./tenants.types";
import { buildSearchWhere, paginate, PaginationParams } from "@/utils/pagination";

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

  async getTenantsWithPagination(params: PaginationParams, search?: string) {
    const where = buildSearchWhere(search, ["name", "subDomain"]);
    return paginate(prisma.tenant, params, {
      where,
      select: {
        id: true,
        name: true,
        subDomain: true,
        plan: true,
        status: true,
      },
    });
  }
  async getTenants() {
   const tenants = await prisma.tenant.findMany()
    return tenants
  }
}
