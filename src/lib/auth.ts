import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { SystemRole } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "E-Mail & Passwort",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bitte E-Mail und Passwort eingeben.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { player: true },
        });

        if (!user || !user.active) {
          throw new Error("Kein aktives Konto mit dieser E-Mail gefunden.");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          throw new Error("Passwort ist falsch.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as SystemRole,
          playerId: user.player?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerId = user.playerId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.playerId = token.playerId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
