import jwt, { SignOptions } from 'jsonwebtoken'
const JWT_ACCESS_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_ACCESS_SECRET) {
  throw new Error('JWT_SECRET is not configured')
}
if (!JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not configured')
}

const JWT_ACCESS_TTL = (process.env.JWT_ACCESS_TTL ?? '15m') as SignOptions['expiresIn']
const JWT_REFRESH_TTL = (process.env.JWT_REFRESH_TTL ?? '7d') as SignOptions['expiresIn']
export const generateAccessToken = (payload: {
  id: string
  email: string
}) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_TTL,
  })
}

export const generateRefreshToken = (payload: {
  id: string
  email: string
}) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}