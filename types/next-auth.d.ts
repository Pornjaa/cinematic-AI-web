import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STUDENT";
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "STUDENT";
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "STUDENT";
    username?: string | null;
  }
}
