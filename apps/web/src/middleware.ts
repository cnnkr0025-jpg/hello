import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authMiddleware = withAuth({});

export default function middleware(request: NextRequest) {
  if (process.env.TEST_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|signin|static).*)"],
};
