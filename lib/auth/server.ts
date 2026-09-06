import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/session";
import { UserRole } from "@/types/auth";

export interface AuthenticatedSession {
  userId: string;
  correo: string;
  role: UserRole;
}

/**
 * Obtiene y valida la sesión actual.
 *
 * Devuelve null cuando:
 * - no existe cookie
 * - el token es inválido
 * - el token expiró
 */
export async function getCurrentSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("sgricn_session")?.value;

  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
}

/**
 * Exige que exista una sesión.
 *
 * Si no existe, devuelve null.
 */
export async function requireSession(): Promise<AuthenticatedSession | null> {
  return getCurrentSession();
}

/**
 * Comprueba si la sesión tiene alguno
 * de los roles permitidos.
 */
export function sessionHasRole(
  session: AuthenticatedSession,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(session.role);
}
