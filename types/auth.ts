export type UserRole = "ADMIN" | "FUNCIONARIO" | "USUARIO";

export interface AuthUser {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: "admin" | "funcionario" | "usuario";
  estado: "activo" | "inactivo";
}
