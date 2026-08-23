import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Serverseitige Rollenprüfung: verhindert, dass Spieler Captain-/Admin-Seiten
// überhaupt aufrufen können (nicht nur UI-Ausblendung). Zusätzlich prüfen
// alle betroffenen API-Routen die Rolle erneut serverseitig.
const CAPTAIN_PLUS = ["CAPTAIN", "MANAGER"];
const MANAGER_ONLY = ["MANAGER"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/discord/interactions") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/icons");

  if (isPublic) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  if (pathname.startsWith("/admin") && !MANAGER_ONLY.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
  }

  if (pathname.startsWith("/captain") && !CAPTAIN_PLUS.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
  }

  if (pathname.startsWith("/api/admin") && !MANAGER_ONLY.includes(role)) {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Auf alles anwenden außer:
     * - Next.js-interne Dateien (_next/static, _next/image)
     * - statische Dateien
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
