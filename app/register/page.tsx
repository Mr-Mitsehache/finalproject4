"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ORGANIZA");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg">
        <div className="p-6">
          {/* Logo / Brand */}
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-slate-700">
              <path d="M12 3l7.5 4.33v9.34L12 21 4.5 16.67V7.33L12 3z" fill="currentColor" />
            </svg>
          </div>

          <h1 className="text-center text-xl font-semibold tracking-tight text-slate-900">สมัครสมาชิก</h1>
          <p className="mt-1 text-center text-sm text-slate-600">สร้างบัญชีใหม่เพื่อเริ่มต้น</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                ชื่อ
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-slate-400">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 20a8 8 0 1116 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                อีเมล
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-slate-400">
                    <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 7l8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                รหัสผ่าน
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-slate-400">
                    <path d="M6 10h12v9H6z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 10V8a4 4 0 118 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 pr-10 text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 inline-flex items-center rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
            </div>

            {/* Role */}
            {/* <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                บทบาท (Role)
              </label>
              <div className="relative mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="USER">USER</option>
                  <option value="ORGANIZA">ORGANIZA</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-400">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">ค่าเริ่มต้นคือ ORGANIZA (ตามระบบของคุณ)</p>
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-slate-800"
              aria-busy={loading}
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="3" />
                  <path d="M22 12a10 10 0 00-10-10" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              )}
              {loading ? "กำลังบันทึก..." : "สมัครสมาชิก"}
            </button>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <span>มีบัญชีอยู่แล้ว? </span>
            <Link href="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
