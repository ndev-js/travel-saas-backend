import { PlatformRole } from "@/generated/prisma/enums"

interface PlatformAdminSignUpReq {
    email: string
    password: string
    fullName: string
    role:PlatformRole
}

interface PlatformLoginReq {
    email: string
    password: string
}

export { PlatformAdminSignUpReq, PlatformLoginReq }