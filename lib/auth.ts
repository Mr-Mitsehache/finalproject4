import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
session: { strategy: "jwt" },
pages: { signIn: "/login" },
providers: [
Credentials({
name: "Email & Password",
credentials: {
email: { label: "Email", type: "email" },
password: { label: "Password", type: "password" },
},
async authorize(credentials) {
if (!credentials?.email || !credentials.password) return null;
const user = await prisma.user.findUnique({ where: { email: credentials.email } });
if (!user || !user.password) return null;
const valid = await bcrypt.compare(credentials.password, user.password);
if (!valid) return null;
return { id: user.id, name: user.name ?? undefined, email: user.email, role: user.role } as any;
},
}),
],
callbacks: {
async jwt({ token, user }) {
if (user) {

token.role = (user as any).role ?? token.role;
}
return token;
},
async session({ session, token }) {
if (session.user) {

session.user.role = token.role;
}
return session;
},
},
};