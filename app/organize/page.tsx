import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizeOnly() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <h1 style={{ padding: 24 }}>Organize Area</h1>
      <Link href="/api/auth/signout">ออกจากระบบ</Link>
    </>
  );
}
