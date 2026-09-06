export type RolUsuario = "admin" | "funcionario" | "usuario";

export type EstadoUsuario = "activo" | "inactivo";

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  telefono: string;
  fechaRegistro: string;
  ultimaSesion: string | null;
  createdAt: string;
  updatedAt: string;
}
