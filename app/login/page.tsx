// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      router.push("/post-login");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background/50 dark:bg-black/10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/50 border border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">ยินดีต้อนรับกลับมา 👋</CardTitle>
              <CardDescription>
                เข้าสู่ระบบเพื่อไปต่อ — เราเก็บฟังก์ชันเดิมไว้ทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
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
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
                <span>ยังไม่มีบัญชี? </span>
                <Link href="/register" className="font-medium underline hover:text-foreground">
                  สมัครสมาชิก
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
