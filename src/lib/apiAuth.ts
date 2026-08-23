import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireRole(roles: Array<"PLAYER" | "CAPTAIN" | "MANAGER">) {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (!roles.includes(session!.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Nicht berechtigt für diese Aktion." }, { status: 403 }),
    };
  }
  return { session, error: null };
}
