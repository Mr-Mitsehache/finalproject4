//app/page.tsx
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">แพลตฟอร์มเพื่อคุณ</h1>
          <Button variant="outline">
            <Link href="/stores" className="text-xl font-bold">
              Go Go Go!
            </Link>
          </Button>
          <Button variant="outline">
            <Link href="/login" className="text-xl font-bold">
              Add Your Store Now
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
