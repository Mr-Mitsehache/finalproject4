//GPT
'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react'

// --- Validation schema (Zod) ---
const LoginSchema = z.object({
  email: z.string().min(1, 'กรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
  remember: z.boolean().optional(),
})

// Place this file at: app/(auth)/login/page.tsx
export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onTouched',
  })

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      })

      if (!res.ok) {
        let msg = 'เข้าสู่ระบบไม่สำเร็จ'
        try {
          const data = await res.json()
          if (data?.message) msg = data.message
        } catch (_) {}
        throw new Error(msg)
      }

      // Success → go home (or redirect via server)
      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ'
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/auth-background.jpg" // put an image into /public/auth-background.jpg
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        {/* subtle grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.700/.35)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 md:py-16 lg:py-24">
        {/* Left rail / brand copy (hidden on small screens) */}
        <div className="hidden md:flex md:flex-col md:justify-center md:pr-8">
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <LogIn className="h-5 w-5 text-primary" />
              </span>
              <p className="text-sm font-medium tracking-wide">ยินดีต้อนรับสู่ระบบของคุณ</p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              เข้าสู่ระบบเพื่อจัดการแพลตฟอร์มของคุณอย่างมั่นใจ
            </h1>
            <p className="max-w-md text-base text-slate-300/80">
              ออกแบบด้วย <span className="font-semibold text-white">Next.js</span> และ
              <span className="font-semibold text-white"> shadcn/ui</span> เน้นความเร็ว ความปลอดภัย และการใช้งานที่ราบรื่น
            </p>
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-border/50 bg-background/70 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
              <CardDescription>กรอกข้อมูลเพื่อเข้าสู่ระบบ</CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              inputMode="email"
                              autoComplete="email"
                              placeholder="your@email.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>รหัสผ่าน</FormLabel>
                          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            ลืมรหัสผ่าน?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className="pl-9 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/60"
                              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id="remember" />
                        </FormControl>
                        <Label htmlFor="remember" className="text-sm text-muted-foreground">
                          จำฉันไว้ในเครื่องนี้
                        </Label>
                      </FormItem>
                    )}
                  />

                  {serverError ? (
                    <Alert variant="destructive" aria-live="polite" role="alert">
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังเข้าสู่ระบบ...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <LogIn className="h-4 w-4" /> เข้าสู่ระบบ
                      </span>
                    )}
                  </Button>

                  {/* Optional: OAuth */}
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      onClick={() => {
                        // Update this path to your OAuth route
                        router.push('/api/auth/google')
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {/* You can replace with a Google icon component if you have one */}
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M21.35 11.1H12v2.9h5.35c-.23 1.48-1.78 4.34-5.35 4.34-3.22 0-5.85-2.67-5.85-5.95S8.78 6.45 12 6.45c1.84 0 3.08.78 3.78 1.45l2.58-2.5C16.9 3.7 14.65 2.8 12 2.8 6.98 2.8 2.9 6.9 2.9 12s4.08 9.2 9.1 9.2c5.26 0 8.7-3.7 8.7-8.9 0-.6-.05-1.05-.15-1.2z" />
                        </svg>
                        ดำเนินการต่อด้วย Google
                      </span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex-col space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                ยังไม่มีบัญชี?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  สมัครสมาชิก
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

//original
"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h1>เข้าสู่ระบบ</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ marginTop: 16 }}>
        ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
      </p>
    </div>
  );
}
