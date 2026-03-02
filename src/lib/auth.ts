import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      // On initial sign-in, `user` is populated from the database record
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "MEMBER";
      }

      // `profile` is the raw OAuth provider payload — only present on sign-in
      if (profile) {
        token.githubUsername = (profile as { login?: string }).login ?? null;

        // Persist githubUsername to the database on first login
        if (token.id) {
          await prisma.user.update({
            where: { id: token.id as string },
            data: {
              githubUsername: (profile as { login?: string }).login ?? null,
            },
          });
        }
      }

      // If role is still missing (e.g. subsequent JWT refreshes), fetch from DB
      if (!token.role && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, githubUsername: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.githubUsername = dbUser.githubUsername ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.githubUsername = (token.githubUsername as string) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
