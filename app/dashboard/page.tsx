import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function DashboardPage() {
const session = await getServerSession(authOptions);
if (!session) redirect("/login");
return (
<main style={{ padding: 24 }}>
<h1>สวัสดี {session.user?.name ?? session.user?.email}</h1>
<p>Role: {session.user?.role}</p>
<a href="/api/auth/signout">ออกจากระบบ</a>
</main>
);
}