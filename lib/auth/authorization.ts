import { NextResponse } from "next/server";
import { UserRole } from "@/types/auth";
import { AuthenticatedSession } from "@/lib/auth/server";

/**
 * Verifica si un rol está incluido
 * dentro de una lista de roles permitidos.
 */
export function roleAllowed(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role);
}

/**
 * Respuesta estándar para una solicitud
 * que no tiene permisos suficientes.
 */
export function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "No tienes permisos para realizar esta acción.",
    },
    {
      status: 403,
    }
  );
}

/**
 * Respuesta estándar cuando no existe
 * una sesión autenticada.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Debes iniciar sesión para realizar esta acción.",
    },
    {
      status: 401,
    }
  );
}

/**
 * Comprueba que exista una sesión.
 */
export function requireAuthenticatedSession(
  session: AuthenticatedSession | null
): session is AuthenticatedSession {
  return session !== null;
}

/**
 * Comprueba que la sesión tenga alguno
 * de los roles permitidos.
 */
export function requireRole(
  session: AuthenticatedSession | null,
  allowedRoles: UserRole[]
): boolean {
  if (!session) {
    return false;
  }

  return roleAllowed(session.role, allowedRoles);
}
