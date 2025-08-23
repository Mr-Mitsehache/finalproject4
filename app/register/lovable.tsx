import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      if (!res.ok) {const errorData = await res.json();
        throw new Error(errorData.message || "การสมัครสมาชิกไม่สำเร็จ");
      }
      navigate("/login");
    } catch (err: any) {
      setError(err.message ?? "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md">
        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
            <CardDescription>สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อของคุณ"
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="กรอกอีเมลของคุณ"
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">บทบาท</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="เลือกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">ผู้ใช้งาน</SelectItem>
                    <SelectItem value="ORGANIZE">ผู้จัดการ</SelectItem>
                    <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "สมัครสมาชิก"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                มีบัญชีอยู่แล้ว?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
