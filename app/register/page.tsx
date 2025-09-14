// app\register\page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState("ORGANIZA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        let message = "สมัครไม่สำเร็จ";
        try {
          const data = await res.json();
          message = data?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      router.replace("/login");
    } catch (err: any) {
      setError(err?.message ?? "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background/60 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-border shadow-xl backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white dark:bg-muted shadow">
                <User className="h-6 w-6 text-foreground" />
              </div>
              <CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
              <CardDescription>สร้างบัญชีใหม่เพื่อเริ่มต้น</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="text-sm font-medium">
                    ชื่อ
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="ชื่อ-นามสกุล"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="text-sm font-medium">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10"
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "สมัครสมาชิก"}
                </Button>

                {/* Error */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-100 border border-red-300 rounded-md p-2">
                    {error}
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                มีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/login"
                  className="font-medium underline underline-offset-4 hover:text-foreground"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
