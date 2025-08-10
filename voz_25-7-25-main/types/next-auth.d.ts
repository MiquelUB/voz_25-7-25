import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
  }
}
