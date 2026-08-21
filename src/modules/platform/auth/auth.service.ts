import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt'
import { ConflictError, ErrorCode, UnauthorizedError } from '@/utils/app-error'
import { PlatformAdminSignUpReq, PlatformLoginReq } from './auth.types'

const BCRYPT_SALT_ROUNDS = 12
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

export class PlatformUserAuthService {

  async registerPlatformUser(data: PlatformAdminSignUpReq) {
    const { fullName, email, password } = data

    const existingUser = await prisma.platformUser.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('User already registered with that email')
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    try {
      const user = await prisma.platformUser.create({
        data: {
          fullName,
          email,
          passwordHash,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      })

      return user
    } catch (err) {
      // Safety net for the race between the findUnique check above and this
      // create: two concurrent signups with the same email can both pass
      // the check, so the unique constraint (not the pre-check) is the real
      // guarantee. P2002 = unique constraint violation.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('User already registered with that email')
      }
      throw err
    }
  }

  async loginPlatformUser(data: PlatformLoginReq) {
    const { email, password } = data

    const user = await prisma.platformUser.findUnique({ where: { email } })

    // Same generic message whether the email doesn't exist or the password
    // is wrong - confirming which one it was lets an attacker enumerate
    // registered emails.
    if (!user || !user.isActive) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE, ErrorCode.INVALID_CREDENTIALS)
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE, ErrorCode.INVALID_CREDENTIALS)
    }

    await prisma.platformUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokenPayload = { id: user.id, email: user.email }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    }
  }
}
