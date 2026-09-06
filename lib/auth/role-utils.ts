import { UserRole } from "@/types/auth";

export function puedeGestionar(role: UserRole): boolean {
  return role === "ADMIN" || role === "FUNCIONARIO";
}

export function esAdministrador(role: UserRole): boolean {
  return role === "ADMIN";
}

export function esUsuario(role: UserRole): boolean {
  return role === "USUARIO";
}
