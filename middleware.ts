import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware that redirects the root path to /login
  // In a real app, you would check for authentication tokens here
  if (request.nextUrl.pathname === "/") {
    // We'll let the client-side auth check handle this instead of redirecting here
    // This allows the auth context to properly initialize
    return NextResponse.next()
  }

  return NextResponse.next()
}
