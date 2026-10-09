import { prisma } from "@/lib/prisma";
import { LeadHandlingMode } from "@/generated/prisma/enums";
import { BadRequestError, NotFoundError } from "@/utils/app-error";
import { LeadCreateReq } from "./leads.types";

export class LeadService {
  async createLead(tenantId: string, data: LeadCreateReq) {
    const { handlingMode = LeadHandlingMode.self, createdById, details, ...rest } = data;

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
      select: { id: true },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }

    // "Handle Myself" keeps the lead with whoever created it; the other two
    // modes hand it to the chosen staff member.
    const assignedToId = handlingMode === LeadHandlingMode.self ? createdById : data.assignedToId;

    // The foreign keys only prove the user exists, not that they belong to
    // this tenant, so that has to be checked here.
    const userIds = [...new Set([createdById, assignedToId].filter((id): id is string => !!id))];
    if (userIds.length > 0) {
      const users = await prisma.user.count({
        where: { id: { in: userIds }, tenantId, isActive: true, deletedAt: null },
      });
      if (users !== userIds.length) {
        throw new BadRequestError("Created by / assigned to must be an active user of this tenant");
      }
    }

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        tenantId,
        details,
        handlingMode,
        createdById,
        assignedToId,
      },
    });

    return lead;
  }

  async getAllTenantLeads(tenantId: string) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
      select: { id: true },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }

    const leads = await prisma.lead.findMany({
      where: { tenantId },
    });

    return leads;
  }
}
