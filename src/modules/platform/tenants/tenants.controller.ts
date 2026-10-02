import { sendSuccess } from "@/utils/api-response";
import { TenantService } from "./tenants.service";
import { createTenantSchema } from "./tenants.validation";
import { paginationQuerySchema, parsePaginationQuery } from "@/utils/pagination";
import type { Request, Response } from "express";


const tenantService  = new TenantService();
export class TenantController {
    async create(req:Request,res:Response):Promise<Response>{
        const data = createTenantSchema.parse(req.body)
        const result = await tenantService.createTenant(data)
        return sendSuccess(res,result,200,'tenant created')
    }
    async tenantsWithPagination(req:Request,res:Response):Promise<Response>{
        const query = paginationQuerySchema.parse(req.query)
        const params = parsePaginationQuery(query, {
            allowedSortFields: ["name", "subDomain", "plan", "status", "createdAt"],
            defaultSortBy: "createdAt",
        })
        const result = await tenantService.getTenantsWithPagination(params, query.search)
        return sendSuccess(res,result,200,'tenants fetched')
    }
    async tenants(_req:Request,res:Response):Promise<Response>{
        const result = await tenantService.getTenants()
        return sendSuccess(res,result,200,'tenants fetched')
    }
}