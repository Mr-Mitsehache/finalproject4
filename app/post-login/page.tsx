import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function PostLogin() {
const session = await getServerSession(authOptions);
if (!session) redirect("/login");
const role = session.user?.role;


if (role === "ADMIN") redirect("/admin");
if (role === "ORGANIZE" && session.user?.id) redirect(`/organize/${session.user.id}`);
redirect("/dashboard");
}