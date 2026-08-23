import { SystemRole } from "@/lib/constants";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: SystemRole;
    playerId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: SystemRole;
      playerId: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: SystemRole;
    playerId: string | null;
  }
}
