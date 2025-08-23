import NextAuth from "next-auth";


declare module "next-auth" {
interface Session {
user: {
name?: string | null;
email?: string | null;
image?: string | null;
role?: "ADMIN" | "ORGANIZE" | "USER";
};
}
}


declare module "next-auth/jwt" {
interface JWT {
role?: "ADMIN" | "ORGANIZE" | "USER";
}
}