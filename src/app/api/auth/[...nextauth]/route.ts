import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend NextAuth types to include 'role' in session and user
import { Session, User } from "next-auth";
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
    accessToken?: string;
  }
  interface User {
    role?: string;
    token?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            return {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              token: data.token,
              employeeId: data.user.employee?._id || null,
            };
          }
          return null;
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.token;
        token.employeeId = user.employeeId; // 👈 save to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.role =
            typeof token.role === "string" ? token.role : undefined;
          session.user.employeeId = token.employeeId as string | undefined; // 👈 attach to session.user
        }
        session.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
