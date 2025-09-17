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
import { Badge } from "@/components/ui/badge";
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
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-plain">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm border shadow-xl 
                           border-red-200 bg-white/70 
                           dark:border-blue-500/50 dark:bg-zinc-900/70">
            <CardHeader className="text-center">
              {/* วงกลม icon ตกแต่ง */}
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full 
                              border border-red-400 bg-white shadow-md 
                              dark:border-blue-500 dark:bg-zinc-800 
                              neon-blue">
                <User className="h-6 w-6 text-red-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-extrabold tracking-wide metal-text">
                สมัครสมาชิก
              </CardTitle>
              <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
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
                <div className="space-y-1">
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
                <div className="space-y-1">
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
                  <Badge
                    variant="destructive"
                    className="block w-full text-center py-2"
                  >
                    {error}
                  </Badge>
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
