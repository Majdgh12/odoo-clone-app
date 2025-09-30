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
      employeeId?: string | null;
      departmentId?: string | null;
    };
    accessToken?: string;
  }
  interface User {
    role?: string;
    token?: string;
    employeeId?: string | null;
    departmentId?: string | null;
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
          console.log("NextAuth login attempt for email:", credentials?.email);

          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();
          console.log("Backend login response:", data);

          if (res.ok && data.token) {
            console.log("Login successful for:", data.user.email);
            return {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              token: data.token,
              employeeId: data.user.employee?._id || null,
              departmentId: data.user.employee?.department_id || null,
            };
          }

          console.log("Login failed for email:", credentials?.email);
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
        console.log("JWT callback - user detected:", user);
        token.role = user.role;
        token.accessToken = user.token;
        token.employeeId = user.employeeId;
        token.departmentId = user.departmentId;
      } else {
        console.log("JWT callback - no user, token:", token);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token);
      if (token) {
        if (session.user) {
          session.user.role =
            typeof token.role === "string" ? token.role : undefined;
          session.user.employeeId =
            typeof token.employeeId === "string" ? token.employeeId : undefined;
          session.user.departmentId =
            typeof token.departmentId === "string"
              ? token.departmentId
              : undefined;
        }
        session.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
      }
      console.log("Session after callback:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
