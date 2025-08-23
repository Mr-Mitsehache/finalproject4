import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";


const schema = z.object({
name: z.string().min(1),
email: z.string().email(),
password: z.string().min(6),
role: z.enum(["ADMIN", "ORGANIZE", "USER"]).optional(),
});


export async function POST(req: Request) {
try {
const body = await req.json();
const { name, email, password, role } = schema.parse(body);


const exists = await prisma.user.findUnique({ where: { email } });
if (exists) {
return NextResponse.json({ message: "Email already registered" }, { status: 409 });
}


const hash = await bcrypt.hash(password, 12);


await prisma.user.create({
data: { name, email, password: hash, role: role ?? "USER" },
});


return NextResponse.json({ message: "Registered" }, { status: 201 });
} catch (e: any) {
return NextResponse.json({ message: e.message ?? "Invalid request" }, { status: 400 });
}
}