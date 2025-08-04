import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: `${user.id_user}`,
          username: user.username,
          email: user.email,
          fullname: user.fullName ?? null,
          photo_url: user.photo_url ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const now = Math.floor(Date.now() / 1000); // Time in seconds

        return {
          ...token,
          id: user.id,
          email: user.email,
          username: user.username,
          fullname: user.fullname ?? null,
          photo_url: user.photo_url ?? null,
          role: user.role,
          exp:
            user.role === "ADMIN"
              ? now + 60 * 60 // 1 jam
              : now + 24 * 60 * 60, // 24 jam
        };
      }

      // Optional: if the token already exists (previous login), make sure exp is still set
      if (!token.exp) {
        const now = Math.floor(Date.now() / 1000);
        token.exp = token.role === "ADMIN" ? now + 60 * 60 : now + 24 * 60 * 60;
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          username: token.username,
          email: token.email,
          fullname: token.fullname ?? null,
          photo_url: token.photo_url ?? null,
          role: token.role,
        },
      };
    },
  },
};
