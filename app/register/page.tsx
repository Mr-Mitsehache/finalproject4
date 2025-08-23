"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus } from "lucide-react";
import authBg from "@/assets/auth-background.jpg";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (!res.ok) throw new Error((await res.json()).message);
      router.replace("/login");
    } catch (err: any) {
      setError(err.message ?? "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>สมัครสมาชิก</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>ชื่อ</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ORGANIZE">ORGANIZE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "Register"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
