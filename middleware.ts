//middleware.ts
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // You can add logging or custom handling here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // ต้อง login ก่อนเสมอสำหรับเส้นทางเหล่านี้
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/organiza")
        ) {
          if (!token) return false;
          const role = (token as any).role as string | undefined;
          if (pathname.startsWith("/admin")) return role === "ADMIN"; // admin only
          if (pathname.startsWith("/organiza"))
            return role === "ORGANIZA" || role === "ADMIN"; // organiza or admin
          return true; // dashboard: any logged-in user
        }
        return true; // public paths
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/organiza/:path*"],
};
