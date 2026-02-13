import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "./db"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Find user in DB
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
        const user = result[0]

        if (!user) return null

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

        if (passwordsMatch) return user

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-expect-error role is not typed
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // @ts-expect-error role is not typed
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
