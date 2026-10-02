import { z } from "zod";
import { ValidationError } from "./app-error";

// Generic pagination building blocks so any module (tenants, users, bookings, ...)
// can offer paginated listing without re-deriving query parsing / meta math.

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions {
  /** Fields callers are allowed to sort by. Omit to allow any sortBy through. */
  allowedSortFields?: string[];
  /** Used when the caller does not pass sortBy. */
  defaultSortBy?: string;
  /** Hard ceiling on `limit`, independent of the schema's own max. */
  maxLimit?: number;
}

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
  orderBy?: Record<string, "asc" | "desc">;
}

// Turns a validated query into skip/take + a safe orderBy, rejecting sort
// fields that aren't in the caller's allowlist (e.g. relation names, secrets).
export function parsePaginationQuery(
  query: PaginationQuery,
  options: PaginationOptions = {}
): PaginationParams {
  const { allowedSortFields, defaultSortBy, maxLimit = 100 } = options;

  const page = query.page;
  const limit = Math.min(query.limit, maxLimit);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ?? defaultSortBy;
  if (sortBy && allowedSortFields && !allowedSortFields.includes(sortBy)) {
    throw new ValidationError(`Cannot sort by '${sortBy}'`, { allowedSortFields });
  }

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy: sortBy ? { [sortBy]: query.sortOrder } : undefined,
  };
}

// Minimal shape any Prisma model delegate satisfies (prisma.tenant, prisma.user, ...).
// `args` is deliberately `any`: Prisma's generated findMany/count signatures use
// per-model conditional types that don't structurally unify across models, so a
// precisely-typed generic wrapper can't be written without `any` at this seam.
interface PaginatableDelegate<T> {
  findMany(args: any): Promise<T[]>;
  count(args?: any): Promise<number>;
}

// Runs findMany + count in parallel against any Prisma delegate and shapes the
// result into { data, meta }. `where`/`select`/`include` pass straight through.
export async function paginate<T>(
  delegate: PaginatableDelegate<T>,
  params: PaginationParams,
  findManyArgs: Record<string, unknown> = {}
): Promise<PaginatedResult<T>> {
  const { skip, take, page, limit, orderBy } = params;
  const where = findManyArgs.where as Record<string, unknown> | undefined;

  const [data, total] = await Promise.all([
    delegate.findMany({
      ...findManyArgs,
      ...(orderBy ? { orderBy } : {}),
      skip,
      take,
    }),
    delegate.count(where ? { where } : undefined),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// Builds a case-insensitive OR-contains `where` clause across the given fields,
// or undefined if there's nothing to search on (so callers can spread it freely).
export function buildSearchWhere(
  search: string | undefined,
  fields: string[]
): Record<string, unknown> | undefined {
  if (!search || fields.length === 0) return undefined;
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    })),
  };
}
