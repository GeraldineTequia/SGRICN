import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types/auth";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("Falta la variable de entorno SESSION_SECRET");
}

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export interface SessionPayload {
  userId: string;
  correo: string;
  role: UserRole;
}

/**
 * Crea el token de sesión del usuario.
 */
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    correo: payload.correo,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);
}

/**
 * Verifica el token y devuelve la información
 * de sesión almacenada dentro del JWT.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.correo !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    const rolesValidos: UserRole[] = ["ADMIN", "FUNCIONARIO", "USUARIO"];

    if (!rolesValidos.includes(payload.role as UserRole)) {
      return null;
    }

    return {
      userId: payload.userId,
      correo: payload.correo,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
