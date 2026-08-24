import { prisma } from "@/lib/prisma";
import { TenantUserCreationInput } from "./users.validations";
import { ConflictError } from "@/utils/app-error";
import bcrypt from "bcrypt";
import { Prisma } from "@/generated/prisma/client";
const BCRYPT_SALT_ROUNDS = 12;

export class UserService {
  async createTenantUser(tenantId: string, data: TenantUserCreationInput) {
    const { email, password, firstName, lastName, isActive } = data;
    const existing = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    });

    if (existing) {
      throw new ConflictError("User Already exist with that email in the tenant");
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    try {
      const user = await prisma.user.create({
        data: {
          tenantId,
          firstName,
          lastName,
          email,
          passwordHash,
          isActive,
        },
      });
      return user;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictError("User already registered with that email");
      }
      throw err;
    }
  }
}
